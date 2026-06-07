const express = require("express");
const {
  createTestCase,
  getTestCasesByProblem,
  deleteTestCase,
} = require("../controllers/testCaseController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin only routes for managing test cases
router.post("/", protect, adminOnly, createTestCase);
router.delete("/:id", protect, adminOnly, deleteTestCase);

// Authenticated users can fetch test cases (controller handles filtering of hidden ones)
router.get("/problem/:problemId", protect, getTestCasesByProblem);

module.exports = router;
