const express = require("express");
const { requestReview, getHistory } = require("../controllers/aiReviewController");
const { protect } = require("../middleware/authMiddleware");
const { aiReviewRateLimiter } = require("../middleware/aiRateLimiter");

const router = express.Router();

// POST /api/ai/review - Request an AI code review (Authenticated & Rate Limited)
router.post("/review", protect, aiReviewRateLimiter, requestReview);

// GET /api/ai/reviews - Fetch history of AI reviews (Authenticated)
router.get("/reviews", protect, getHistory);

module.exports = router;
