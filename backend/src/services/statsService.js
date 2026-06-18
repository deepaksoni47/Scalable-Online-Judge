const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const UserStats = require("../models/UserStats");

const ACCEPTED_VERDICT = "Accepted";

const toDayKey = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  return value.toISOString().slice(0, 10);
};

const getPreviousDayKey = (dayKey) => {
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return toDayKey(date);
};

const calculateCurrentStreak = (dayKeys) => {
  if (!dayKeys.length) {
    return 0;
  }

  const uniqueDays = [...new Set(dayKeys)].sort();
  let streak = 1;

  for (let index = uniqueDays.length - 1; index > 0; index--) {
    if (uniqueDays[index - 1] !== getPreviousDayKey(uniqueDays[index])) {
      break;
    }

    streak++;
  }

  return streak;
};

const getBadgeForSolvedCount = (solvedProblems = 0) => {
  if (solvedProblems > 300) {
    return "Expert";
  }

  if (solvedProblems >= 101) {
    return "Advanced";
  }

  if (solvedProblems >= 26) {
    return "Intermediate";
  }

  return "Beginner";
};

const calculateAcceptanceRate = (acceptedSubmissions = 0, totalSubmissions = 0) => {
  if (!totalSubmissions) {
    return 0;
  }

  return Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2));
};

const normalizeStats = (stats) => {
  const raw = typeof stats.toObject === "function" ? stats.toObject() : stats;
  const todayKey = toDayKey(new Date());
  const yesterdayKey = getPreviousDayKey(todayKey);
  const lastAcceptedDayKey = raw.lastAcceptedAt ? toDayKey(raw.lastAcceptedAt) : null;
  const currentStreak =
    lastAcceptedDayKey === todayKey || lastAcceptedDayKey === yesterdayKey
      ? raw.currentStreak || 0
      : 0;

  return {
    totalSubmissions: raw.totalSubmissions || 0,
    acceptedSubmissions: raw.acceptedSubmissions || 0,
    solvedProblems: raw.solvedProblems || 0,
    easySolved: raw.easySolved || 0,
    mediumSolved: raw.mediumSolved || 0,
    hardSolved: raw.hardSolved || 0,
    acceptanceRate: calculateAcceptanceRate(raw.acceptedSubmissions, raw.totalSubmissions),
    averageExecutionTime: Number((raw.averageExecutionTime || 0).toFixed(2)),
    currentStreak,
    longestStreak: raw.longestStreak || 0,
    lastSubmissionAt: raw.lastSubmissionAt || null,
    badge: getBadgeForSolvedCount(raw.solvedProblems || 0),
  };
};

const updateUserStatsForSubmission = async (submission) => {
  const stats = await UserStats.findOne({ userId: submission.userId }).select(
    "+solvedProblemIds +acceptedSubmissionDays +acceptedExecutionTimeTotal",
  );

  const nextStats =
    stats ||
    new UserStats({
      userId: submission.userId,
    });

  nextStats.totalSubmissions += 1;
  nextStats.lastSubmissionAt = submission.createdAt || new Date();

  if (submission.verdict === ACCEPTED_VERDICT) {
    nextStats.acceptedSubmissions += 1;
    nextStats.acceptedExecutionTimeTotal += submission.executionTime || 0;
    nextStats.averageExecutionTime =
      nextStats.acceptedExecutionTimeTotal / nextStats.acceptedSubmissions;
    nextStats.lastAcceptedAt = submission.createdAt || new Date();

    const problemId = submission.problemId.toString();
    const hasSolvedProblem = nextStats.solvedProblemIds.some(
      (solvedProblemId) => solvedProblemId.toString() === problemId,
    );

    if (!hasSolvedProblem) {
      const problem = await Problem.findById(submission.problemId).select("difficulty");

      nextStats.solvedProblemIds.push(submission.problemId);
      nextStats.solvedProblems += 1;

      if (problem?.difficulty === "Easy") {
        nextStats.easySolved += 1;
      } else if (problem?.difficulty === "Medium") {
        nextStats.mediumSolved += 1;
      } else if (problem?.difficulty === "Hard") {
        nextStats.hardSolved += 1;
      }
    }

    const acceptedDayKey = toDayKey(submission.createdAt || new Date());

    if (!nextStats.acceptedSubmissionDays.includes(acceptedDayKey)) {
      nextStats.acceptedSubmissionDays.push(acceptedDayKey);
      nextStats.acceptedSubmissionDays.sort();
      nextStats.currentStreak = calculateCurrentStreak(nextStats.acceptedSubmissionDays);
      nextStats.longestStreak = Math.max(nextStats.longestStreak, nextStats.currentStreak);
    }
  }

  await nextStats.save();
  return nextStats;
};

const getSubmissionTrends = async (userId, days = 14) => {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const rows = await Submission.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        submissions: { $sum: 1 },
        accepted: {
          $sum: {
            $cond: [{ $eq: ["$verdict", ACCEPTED_VERDICT] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trendMap = new Map(rows.map((row) => [row._id, row]));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);
    const day = toDayKey(date);
    const row = trendMap.get(day);

    return {
      day,
      submissions: row?.submissions || 0,
      accepted: row?.accepted || 0,
    };
  });
};

module.exports = {
  ACCEPTED_VERDICT,
  calculateAcceptanceRate,
  getBadgeForSolvedCount,
  getSubmissionTrends,
  normalizeStats,
  updateUserStatsForSubmission,
};
