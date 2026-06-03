const express = require("express");
const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, adminOnly, createProblem)
  .get(getAllProblems);

router
  .route("/:id")
  .get(getProblemById)
  .put(protect, adminOnly, updateProblem)
  .delete(protect, adminOnly, deleteProblem);

module.exports = router;
