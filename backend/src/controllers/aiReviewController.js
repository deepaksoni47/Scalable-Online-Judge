const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const {
  getOrGenerateReview,
  getUserReviewHistory,
} = require("../ai/reviewService");

/**
 * Request an AI review for a code submission.
 */
const requestReview = asyncHandler(async (req, res) => {
  const { problemId, code, language } = req.body;
  const userId = req.user.id;

  // Basic Validation
  if (!problemId) {
    throw new ApiError(400, "Problem ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid Problem ID format");
  }

  if (!code || !code.trim()) {
    throw new ApiError(400, "Code is required and cannot be empty");
  }

  if (!language || !language.trim()) {
    throw new ApiError(400, "Language is required");
  }

  const result = await getOrGenerateReview({
    userId,
    problemId,
    code,
    language,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "AI Review generated successfully", result));
});

/**
 * Fetch all reviews requested by the authenticated user.
 */
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const history = await getUserReviewHistory(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "AI Review history fetched successfully", history));
});

module.exports = {
  requestReview,
  getHistory,
};
