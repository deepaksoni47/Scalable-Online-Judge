const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID is required"],
    },
    input: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      required: [true, "Expected output is required"],
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TestCase", testCaseSchema);
