const Submission = require("../models/Submission");
const TestCase = require("../models/TestCase");
const Problem = require("../models/Problem");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const generateFile = require("../compiler/generateFile");
const generateInputFile = require("../compiler/generateInputFile");
const executeCode = require("../compiler/executeCode");
const compareOutput = require("../utils/compareOutput");
const { updateUserStatsForSubmission } = require("../services/statsService");
const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const supportedLanguages = ["cpp", "python", "java"];

/**
 * Submit a solution to a problem and evaluate it in the Docker sandbox.
 * Authenticated users only.
 */
const submitSolution = asyncHandler(async (req, res) => {
  const { problemId, language, code } = req.body;
  const userId = req.user.id;

  // 1. Validate request
  if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid or missing problem ID");
  }

  if (!language || !supportedLanguages.includes(language)) {
    throw new ApiError(400, `Supported languages are: ${supportedLanguages.join(", ")}`);
  }

  if (!code || !code.trim()) {
    throw new ApiError(400, "Code content is required");
  }

  // Check if problem exists
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // 2. Fetch all test cases
  const testCases = await TestCase.find({ problemId }).sort({ createdAt: 1 });
  if (testCases.length === 0) {
    throw new ApiError(400, "No test cases configured for this problem. Cannot evaluate submission.");
  }

  // 3. Generate the code source file
  let codeFilePath;
  try {
    codeFilePath = await generateFile({ language, code });
  } catch (error) {
    throw new ApiError(500, "Failed to generate source file: " + error.message);
  }

  let verdict = "Accepted";
  let passedTestCases = 0;
  const totalTestCases = testCases.length;
  let maxExecutionTime = 0;
  let hasCompilationError = false;
  let compilationErrorMessage = "";
  let lastContainerId = "N/A";
  let memoryUsed = 12400; // default mock memory usage in KB (approx 12MB)

  // 4. Run against each test case
  try {
    for (let i = 0; i < totalTestCases; i++) {
      const testCase = testCases[i];
      let inputFilePath;

      try {
        // Create temporary input file
        inputFilePath = await generateInputFile(testCase.input);

        // Execute code and measure time
        const startTime = performance.now();
        const output = await executeCode({
          language,
          codeFilePath,
          inputFilePath,
        });
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        maxExecutionTime = Math.max(maxExecutionTime, duration);

        // Compare output
        const isMatch = compareOutput(output, testCase.expectedOutput);
        if (isMatch) {
          passedTestCases++;
        } else {
          verdict = "Wrong Answer";
          break; // Stop on first mismatch
        }
      } catch (error) {
        lastContainerId = error.containerName || "N/A";

        // Handle sandbox exceptions
        if (error.errorType === "CompilationError") {
          hasCompilationError = true;
          verdict = "Compilation Error";
          compilationErrorMessage = error.message;
        } else if (error.errorType === "TimeLimitExceeded") {
          verdict = "Time Limit Exceeded";
          maxExecutionTime = 2000;
        } else if (error.errorType === "MemoryLimitExceeded") {
          verdict = "Memory Limit Exceeded";
          memoryUsed = 262144; // 256MB in KB
        } else {
          verdict = "Runtime Error";
        }
        break; // Stop on any error
      } finally {
        // Cleanup temporary input file
        if (inputFilePath && fs.existsSync(inputFilePath)) {
          try {
            fs.unlinkSync(inputFilePath);
          } catch (err) {}
        }
      }
    }
  } finally {
    // Cleanup generated source file and its directory
    if (codeFilePath) {
      const jobDir = path.dirname(codeFilePath);
      if (fs.existsSync(codeFilePath)) {
        try { fs.unlinkSync(codeFilePath); } catch (e) {}
      }
      if (fs.existsSync(jobDir)) {
        try { fs.rmSync(jobDir, { recursive: true, force: true }); } catch (e) {}
      }
    }
  }

  // Log details for monitoring/audit
  console.log(`[Submission Sandbox Log]
----------------------------------------
Container ID: ${lastContainerId}
Execution Time: ${hasCompilationError ? 0 : maxExecutionTime} ms
Memory Usage: ${hasCompilationError ? 0 : memoryUsed} KB
Verdict: ${verdict}
Passed Test Cases: ${passedTestCases} / ${totalTestCases}
----------------------------------------`);

  // 5. Store the submission in database
  const submission = await Submission.create({
    userId,
    problemId,
    code,
    language,
    verdict,
    executionTime: hasCompilationError ? 0 : maxExecutionTime,
    memoryUsed: hasCompilationError ? 0 : memoryUsed,
    passedTestCases,
    totalTestCases,
  });

  await updateUserStatsForSubmission(submission);

  // Return response
  return res.status(201).json(
    new ApiResponse(201, "Submission evaluated successfully", {
      submissionId: submission._id,
      problemId: submission.problemId,
      verdict: submission.verdict,
      language: submission.language,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      passedTestCases: submission.passedTestCases,
      totalTestCases: submission.totalTestCases,
      createdAt: submission.createdAt,
      compilationError: hasCompilationError ? compilationErrorMessage : null,
    })
  );
});

/**
 * Get submission history of the authenticated user.
 */
const getMySubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const submissions = await Submission.find({ userId })
    .select("_id problemId verdict language createdAt")
    .populate("problemId", "title slug")
    .sort({ createdAt: -1 });

  const formattedSubmissions = submissions.map((sub) => ({
    submissionId: sub._id,
    problemId: sub.problemId,
    verdict: sub.verdict,
    language: sub.language,
    createdAt: sub.createdAt,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, "Submissions retrieved successfully", formattedSubmissions));
});

/**
 * Get full submission details by ID.
 */
const getSubmissionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid or missing submission ID");
  }

  const submission = await Submission.findById(id)
    .populate("problemId", "title slug statement")
    .populate("userId", "name email");

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  if (submission.userId._id.toString() !== req.user.id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to view this submission");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Submission details retrieved successfully", submission));
});

module.exports = {
  submitSolution,
  getMySubmissions,
  getSubmissionById,
};
