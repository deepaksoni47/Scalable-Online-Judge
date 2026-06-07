const TestCase = require("../models/TestCase");
const Problem = require("../models/Problem");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

/**
 * Create a new test case for a problem.
 * Admin only.
 */
const createTestCase = asyncHandler(async (req, res) => {
  const { problemId, input, expectedOutput, isHidden } = req.body;

  if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid or missing problem ID");
  }

  if (expectedOutput === undefined || expectedOutput === null) {
    throw new ApiError(400, "Expected output is required");
  }

  // Check if problem exists
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  const testCase = await TestCase.create({
    problemId,
    input: input ?? "",
    expectedOutput: String(expectedOutput),
    isHidden: typeof isHidden === "boolean" ? isHidden : false,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Test case created successfully", testCase));
});

/**
 * Get all test cases for a problem.
 * Admins can see all.
 * Normal authenticated users can see only non-hidden ones.
 */
const getTestCasesByProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid or missing problem ID");
  }

  const query = { problemId };

  // If user is not admin, they can only see non-hidden test cases
  if (!req.user || req.user.role !== "admin") {
    query.isHidden = false;
  }

  const testCases = await TestCase.find(query).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Test cases fetched successfully", testCases));
});

/**
 * Delete a test case.
 * Admin only.
 */
const deleteTestCase = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid or missing test case ID");
  }

  const testCase = await TestCase.findByIdAndDelete(id);

  if (!testCase) {
    throw new ApiError(404, "Test case not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Test case deleted successfully", null));
});

module.exports = {
  createTestCase,
  getTestCasesByProblem,
  deleteTestCase,
};
