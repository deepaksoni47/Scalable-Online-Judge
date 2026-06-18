const mongoose = require("mongoose");

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
      min: 0,
    },
    solvedProblems: {
      type: Number,
      default: 0,
      min: 0,
    },
    easySolved: {
      type: Number,
      default: 0,
      min: 0,
    },
    mediumSolved: {
      type: Number,
      default: 0,
      min: 0,
    },
    hardSolved: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageExecutionTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    acceptedExecutionTimeTotal: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },
    solvedProblemIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Problem",
      default: [],
      select: false,
    },
    acceptedSubmissionDays: {
      type: [String],
      default: [],
      select: false,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSubmissionAt: {
      type: Date,
      default: null,
    },
    lastAcceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userStatsSchema.index({
  solvedProblems: -1,
  acceptedSubmissions: -1,
  averageExecutionTime: 1,
});

module.exports = mongoose.model("UserStats", userStatsSchema);
