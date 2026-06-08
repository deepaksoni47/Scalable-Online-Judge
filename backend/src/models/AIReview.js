const mongoose = require("mongoose");

const aiReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID is required"],
      index: true,
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
    },
    review: {
      type: String,
      required: [true, "Review content is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for caching reviews: if the same code is sent for the same problem and language, we can easily find it.
aiReviewSchema.index({ problemId: 1, language: 1, code: 1 });

module.exports = mongoose.model("AIReview", aiReviewSchema);
