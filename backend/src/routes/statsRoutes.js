const express = require("express");
const { getMyStats, getPublicUserStats } = require("../controllers/statsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, getMyStats);
router.get("/user/:userId", getPublicUserStats);

module.exports = router;
