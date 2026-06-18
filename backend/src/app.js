const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const compilerRoutes = require("./routes/compilerRoutes");
const testCaseRoutes = require("./routes/testCaseRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const statsRoutes = require("./routes/statsRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/compiler", compilerRoutes);
app.use("/api/testcases", testCaseRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
