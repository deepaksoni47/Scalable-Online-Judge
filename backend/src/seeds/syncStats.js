require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Submission = require("../models/Submission");
const UserStats = require("../models/UserStats");
const { updateUserStatsForSubmission } = require("../services/statsService");

const run = async () => {
  await connectDB();
  
  console.log("Recalculating and syncing all user statistics from submissions...");
  
  // Clear existing stats to do a full rebuild
  await UserStats.deleteMany({});
  console.log("Cleared existing UserStats documents");

  // Fetch all submissions sorted by creation date to update streaks and stats chronologically
  const submissions = await Submission.find({}).sort({ createdAt: 1 });
  console.log(`Found ${submissions.length} submissions to process`);

  for (const sub of submissions) {
    try {
      await updateUserStatsForSubmission(sub);
      console.log(`Processed submission ${sub._id} for user ${sub.userId} (Verdict: ${sub.verdict})`);
    } catch (err) {
      console.error(`Error processing submission ${sub._id}:`, err);
    }
  }

  console.log("Statistics sync completed successfully.");
};

run().catch(console.error).finally(() => mongoose.connection.close());
