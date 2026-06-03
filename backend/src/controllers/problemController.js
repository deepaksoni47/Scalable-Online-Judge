const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const problemService = require("../services/problemService");

const createProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.createProblem(req.body, req.user.id);

  return res
    .status(201)
    .json(new ApiResponse(201, "Problem created successfully", problem));
});

const getAllProblems = asyncHandler(async (req, res) => {
  const result = await problemService.getAllProblems(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Problems fetched successfully", result));
});

const getProblemById = asyncHandler(async (req, res) => {
  const problem = await problemService.getProblemById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem fetched successfully", problem));
});

const updateProblem = asyncHandler(async (req, res) => {
  const problem = await problemService.updateProblem(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem updated successfully", problem));
});

const deleteProblem = asyncHandler(async (req, res) => {
  await problemService.deleteProblem(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Problem deleted successfully", null));
});

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
