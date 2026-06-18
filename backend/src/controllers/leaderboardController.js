const UserStats = require("../models/UserStats");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { calculateAcceptanceRate, getBadgeForSolvedCount } = require("../services/statsService");

const allowedSortFields = new Set([
  "solvedProblems",
  "acceptedSubmissions",
  "averageExecutionTime",
  "acceptanceRate",
]);

const getLeaderboard = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const sortBy = allowedSortFields.has(req.query.sortBy)
    ? req.query.sortBy
    : "solvedProblems";
  const order = req.query.order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const sortStage =
    sortBy === "acceptanceRate"
      ? { acceptanceRate: order, solvedProblems: -1, acceptedSubmissions: -1, averageExecutionTime: 1 }
      : {
          [sortBy]: sortBy === "averageExecutionTime" ? (req.query.order === "desc" ? -1 : 1) : order,
          solvedProblems: -1,
          acceptedSubmissions: -1,
          averageExecutionTime: 1,
        };

  const rows = await UserStats.aggregate([
    {
      $addFields: {
        acceptanceRate: {
          $cond: [
            { $eq: ["$totalSubmissions", 0] },
            0,
            { $multiply: [{ $divide: ["$acceptedSubmissions", "$totalSubmissions"] }, 100] },
          ],
        },
      },
    },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        users: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: 0,
              userId: "$user._id",
              username: "$user.name",
              solvedProblems: 1,
              acceptedSubmissions: 1,
              averageExecutionTime: 1,
              acceptanceRate: 1,
            },
          },
        ],
      },
    },
  ]);

  const total = rows[0]?.metadata[0]?.total || 0;
  const leaderboard = (rows[0]?.users || []).map((user, index) => ({
    rank: skip + index + 1,
    userId: user.userId,
    username: user.username,
    solvedProblems: user.solvedProblems,
    acceptedSubmissions: user.acceptedSubmissions,
    acceptanceRate: Number((user.acceptanceRate || 0).toFixed(2)),
    averageExecutionTime: Number((user.averageExecutionTime || 0).toFixed(2)),
    badge: getBadgeForSolvedCount(user.solvedProblems),
  }));

  return res.status(200).json(
    new ApiResponse(200, "Leaderboard retrieved successfully", {
      leaderboard,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      sort: {
        sortBy,
        order: req.query.order === "asc" ? "asc" : "desc",
      },
    }),
  );
});

module.exports = {
  getLeaderboard,
};
