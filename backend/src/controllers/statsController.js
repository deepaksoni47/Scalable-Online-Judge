const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const User = require("../models/User");
const UserStats = require("../models/UserStats");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  calculateAcceptanceRate,
  getSubmissionTrends,
  normalizeStats,
} = require("../services/statsService");

const getOrCreateUserStats = async (userId) => {
  const existing = await UserStats.findOne({ userId });

  if (existing) {
    return existing;
  }

  return UserStats.create({ userId });
};

const getRecentActivity = async (userId) => {
  const submissions = await Submission.find({ userId })
    .select("_id problemId verdict language executionTime createdAt")
    .populate("problemId", "title slug")
    .sort({ createdAt: -1 })
    .limit(10);

  return submissions.map((submission) => ({
    submissionId: submission._id,
    problemId: submission.problemId?._id,
    problemTitle: submission.problemId?.title || "Deleted problem",
    problemSlug: submission.problemId?.slug || "",
    verdict: submission.verdict,
    language: submission.language,
    executionTime: submission.executionTime,
    createdAt: submission.createdAt,
  }));
};

const getMyStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const stats = await getOrCreateUserStats(userId);
  const normalizedStats = normalizeStats(stats);
  const trends = await getSubmissionTrends(userId);
  const recentActivity = await getRecentActivity(userId);

  return res.status(200).json(
    new ApiResponse(200, "User statistics retrieved successfully", {
      ...normalizedStats,
      difficultyDistribution: [
        { difficulty: "Easy", solved: normalizedStats.easySolved },
        { difficulty: "Medium", solved: normalizedStats.mediumSolved },
        { difficulty: "Hard", solved: normalizedStats.hardSolved },
      ],
      submissionTrends: trends,
      recentActivity,
    }),
  );
});

const getPublicUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId).select("name");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const stats = await getOrCreateUserStats(user._id);

  return res.status(200).json(
    new ApiResponse(200, "Public user statistics retrieved successfully", {
      username: user.name,
      solvedProblems: stats.solvedProblems,
      acceptedSubmissions: stats.acceptedSubmissions,
      acceptanceRate: calculateAcceptanceRate(stats.acceptedSubmissions, stats.totalSubmissions),
    }),
  );
});

module.exports = {
  getMyStats,
  getPublicUserStats,
};
