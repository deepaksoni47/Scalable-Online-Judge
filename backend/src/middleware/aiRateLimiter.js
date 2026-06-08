const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const AIReview = require("../models/AIReview");

/**
 * Middleware to enforce a limit of 5 AI reviews per hour per user.
 */
const aiReviewRateLimiter = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Authentication required");
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Count how many reviews this user has requested in the last hour
  const count = await AIReview.countDocuments({
    userId: req.user.id,
    createdAt: { $gte: oneHourAgo },
  });

  if (count >= 5) {
    throw new ApiError(
      429,
      "Rate limit exceeded: You are allowed up to 5 AI reviews per hour. Please try again later."
    );
  }

  next();
});

module.exports = { aiReviewRateLimiter };
