const express = require("express");
const {
  submitSolution,
  getMySubmissions,
  getSubmissionById,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All submission routes require authentication
router.use(protect);

router.post("/submit", submitSolution);
router.get("/my", getMySubmissions);
router.get("/:id", getSubmissionById);

module.exports = router;
