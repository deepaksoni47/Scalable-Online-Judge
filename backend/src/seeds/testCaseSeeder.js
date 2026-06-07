require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Problem = require("../models/Problem");
const User = require("../models/User");
const TestCase = require("../models/TestCase");
const slugify = require("../utils/slugify");

const seedTestCases = async () => {
  await connectDB();

  // Find admin user to assign problem ownership
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("Error: Please create at least one admin user in the system first before running this seeder.");
    process.exit(1);
  }

  console.log("Seeding 'A + B Problem'...");

  // 1. Create A + B Problem
  const abProblemData = {
    title: "A + B Problem",
    slug: slugify("A + B Problem"),
    statement: "Given two integers A and B, compute and output their sum A + B.\n\nInput format:\nTwo space-separated integers on a single line.\n\nOutput format:\nA single integer representing the sum.",
    inputFormat: "Two space-separated integers A and B.",
    outputFormat: "A single integer sum of A and B.",
    constraints: "-10^9 <= A, B <= 10^9",
    difficulty: "Easy",
    tags: ["math", "basic"],
    examples: [
      {
        input: "5 10",
        output: "15",
        explanation: "5 + 10 = 15"
      }
    ],
    createdBy: admin._id,
    isPublished: true,
  };

  // Find or update the problem
  let problem = await Problem.findOne({ slug: abProblemData.slug });
  if (problem) {
    await Problem.updateOne({ _id: problem._id }, abProblemData);
    console.log("Updated existing 'A + B Problem'");
  } else {
    problem = await Problem.create(abProblemData);
    console.log("Created new 'A + B Problem'");
  }

  // 2. Clear existing test cases for this problem
  await TestCase.deleteMany({ problemId: problem._id });
  console.log("Cleared old test cases for 'A + B Problem'");

  // 3. Create public and hidden test cases for A + B Problem
  const testCasesData = [
    {
      problemId: problem._id,
      input: "5 10",
      expectedOutput: "15",
      isHidden: false,
    },
    {
      problemId: problem._id,
      input: "-1 5",
      expectedOutput: "4",
      isHidden: false,
    },
    {
      problemId: problem._id,
      input: "100 200",
      expectedOutput: "300",
      isHidden: true,
    },
    {
      problemId: problem._id,
      input: "0 0",
      expectedOutput: "0",
      isHidden: true,
    },
    {
      problemId: problem._id,
      input: "1000 -1000",
      expectedOutput: "0",
      isHidden: true,
    },
  ];

  await TestCase.insertMany(testCasesData);
  console.log("Seeded 5 test cases (2 public, 3 hidden) for 'A + B Problem' successfully");
};

seedTestCases()
  .catch((error) => {
    console.error("Test case seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
