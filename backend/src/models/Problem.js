const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      trim: true,
      default: "",
    },
    output: {
      type: String,
      trim: true,
      default: "",
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    statement: {
      type: String,
      required: [true, "Statement is required"],
      trim: true,
    },
    inputFormat: {
      type: String,
      trim: true,
      default: "",
    },
    outputFormat: {
      type: String,
      trim: true,
      default: "",
    },
    constraints: {
      type: String,
      trim: true,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
          : [],
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Problem creator is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

problemSchema.index({ title: "text" });
problemSchema.index({ difficulty: 1, tags: 1, isPublished: 1 });

module.exports = mongoose.model("Problem", problemSchema);
