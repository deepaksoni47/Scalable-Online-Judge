const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID is required"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
    },
    verdict: {
      type: String,
      required: [true, "Verdict is required"],
      enum: ["Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded", "Memory Limit Exceeded"],
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memoryUsed: {
      type: Number,
      default: 0,
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);
