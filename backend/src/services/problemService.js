const Problem = require("../models/Problem");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

const allowedDifficulties = ["Easy", "Medium", "Hard"];

const normalizeTags = (tags) => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
};

const validateProblemPayload = (payload, { partial = false } = {}) => {
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "title")) {
    if (!payload.title || !String(payload.title).trim()) {
      errors.push("Title is required");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "statement")) {
    if (!payload.statement || !String(payload.statement).trim()) {
      errors.push("Statement is required");
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "difficulty")) {
    if (!allowedDifficulties.includes(payload.difficulty)) {
      errors.push("Difficulty must be Easy, Medium or Hard");
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join(", "));
  }
};

const ensureUniqueSlug = async (slug, ignoredProblemId = null) => {
  const query = { slug };

  if (ignoredProblemId) {
    query._id = { $ne: ignoredProblemId };
  }

  const existingProblem = await Problem.findOne(query);
  if (existingProblem) {
    throw new ApiError(400, "Problem slug already exists");
  }
};

const validateProblemId = (problemId) => {
  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiError(400, "Invalid problem id");
  }
};

const buildProblemData = (payload, creatorId) => {
  const data = {
    title: payload.title.trim(),
    slug: slugify(payload.title),
    statement: payload.statement.trim(),
    inputFormat: payload.inputFormat || "",
    outputFormat: payload.outputFormat || "",
    constraints: payload.constraints || "",
    difficulty: payload.difficulty,
    tags: normalizeTags(payload.tags),
    examples: Array.isArray(payload.examples) ? payload.examples : [],
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : false,
  };

  if (creatorId) {
    data.createdBy = creatorId;
  }

  return data;
};

const createProblem = async (payload, creatorId) => {
  validateProblemPayload(payload);

  const problemData = buildProblemData(payload, creatorId);
  if (!problemData.slug) {
    throw new ApiError(400, "Title must contain letters or numbers");
  }

  await ensureUniqueSlug(problemData.slug);

  return Problem.create(problemData);
};

const getAllProblems = async (queryParams) => {
  const page = Math.max(parseInt(queryParams.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(queryParams.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };

  if (queryParams.search) {
    filter.title = { $regex: String(queryParams.search).trim(), $options: "i" };
  }

  if (queryParams.difficulty) {
    if (!allowedDifficulties.includes(queryParams.difficulty)) {
      throw new ApiError(400, "Difficulty must be Easy, Medium or Hard");
    }
    filter.difficulty = queryParams.difficulty;
  }

  const tags = normalizeTags(queryParams.tags);
  if (tags.length > 0) {
    filter.tags = { $all: tags };
  }

  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select("-statement -inputFormat -outputFormat -constraints")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Problem.countDocuments(filter),
  ]);

  return {
    problems,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProblemById = async (problemId) => {
  validateProblemId(problemId);

  const problem = await Problem.findOne({
    _id: problemId,
    isPublished: true,
  }).populate("createdBy", "name email role");

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return problem;
};

const updateProblem = async (problemId, payload) => {
  validateProblemId(problemId);
  validateProblemPayload(payload, { partial: true });

  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  const updates = {};
  const allowedFields = [
    "statement",
    "inputFormat",
    "outputFormat",
    "constraints",
    "difficulty",
    "examples",
    "isPublished",
  ];

  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    updates.title = payload.title.trim();
    updates.slug = slugify(payload.title);

    if (!updates.slug) {
      throw new ApiError(400, "Title must contain letters or numbers");
    }

    await ensureUniqueSlug(updates.slug, problemId);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    updates.tags = normalizeTags(payload.tags);
  }

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  });

  return Problem.findByIdAndUpdate(problemId, updates, {
    new: true,
    runValidators: true,
  });
};

const deleteProblem = async (problemId) => {
  validateProblemId(problemId);

  const problem = await Problem.findByIdAndDelete(problemId);

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return problem;
};

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
