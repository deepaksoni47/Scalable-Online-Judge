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
const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const supportedLanguages = ["cpp", "java", "python"];

/**
 * Submit a solution to a problem and evaluate it.
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

  // 2. Fetch all test cases (both hidden and visible)
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
          if (verdict === "Accepted") {
            verdict = "Wrong Answer";
          }
        }
      } catch (error) {
        // Handle compilation errors vs runtime errors
        if (error.errorType === "CompilationError") {
          hasCompilationError = true;
          verdict = "Compilation Error";
          compilationErrorMessage = error.message;
          break; // Stop running test cases if compilation failed
        } else {
          // Runtime error or other execution failures
          if (verdict === "Accepted" || verdict === "Wrong Answer") {
            verdict = "Runtime Error";
          }
          // Continue execution of other test cases to get the full count, if desired.
          // Or we can stop. Here we continue to gather max passed count.
        }
      } finally {
        // Cleanup temporary input file
        if (inputFilePath && fs.existsSync(inputFilePath)) {
          fs.unlinkSync(inputFilePath);
        }
      }
    }
  } finally {
    // Cleanup generated source file and its directory
    if (codeFilePath) {
      const jobDir = path.dirname(codeFilePath);
      if (fs.existsSync(codeFilePath)) {
        fs.unlinkSync(codeFilePath);
      }
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    }
  }

  // 5. Store the submission in database
  const submission = await Submission.create({
    userId,
    problemId,
    code,
    language,
    verdict,
    executionTime: hasCompilationError ? 0 : maxExecutionTime,
    memoryUsed: 0, // Mock or default to 0 before Docker sandboxing
    passedTestCases: hasCompilationError ? 0 : passedTestCases,
    totalTestCases,
  });

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
 * Return minimal fields: submissionId, problemId, verdict, language, createdAt.
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
 * Authenticated user only.
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

  // Security check: Only the submission owner or an admin can access full details
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
