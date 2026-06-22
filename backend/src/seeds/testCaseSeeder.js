require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Problem = require("../models/Problem");
const User = require("../models/User");
const TestCase = require("../models/TestCase");
const slugify = require("../utils/slugify");

// Test case definitions for all 5 seeded problems
const problemTestCases = [
  {
    title: "Two Sum",
    slug: slugify("Two Sum"),
    testCases: [
      // Public examples
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
      // Hidden test cases
      { input: "2\n3 3\n6", expectedOutput: "0 1", isHidden: true },
      { input: "4\n1 2 3 4\n7", expectedOutput: "2 3", isHidden: true },
      { input: "5\n0 4 3 0 -1\n-1", expectedOutput: "2 4", isHidden: true },
    ],
  },
  {
    title: "Reverse String",
    slug: slugify("Reverse String"),
    testCases: [
      // Public examples
      { input: "5\nh e l l o", expectedOutput: "o l l e h", isHidden: false },
      { input: "7\nH a n n a h !", expectedOutput: "! h a n n a H", isHidden: false },
      // Hidden test cases
      { input: "1\na", expectedOutput: "a", isHidden: true },
      { input: "3\na b c", expectedOutput: "c b a", isHidden: true },
      { input: "4\nA B C D", expectedOutput: "D C B A", isHidden: true },
    ],
  },
  {
    title: "Palindrome Number",
    slug: slugify("Palindrome Number"),
    testCases: [
      // Public examples
      { input: "121", expectedOutput: "true", isHidden: false },
      { input: "-121", expectedOutput: "false", isHidden: false },
      // Hidden test cases
      { input: "10", expectedOutput: "false", isHidden: true },
      { input: "0", expectedOutput: "true", isHidden: true },
      { input: "1221", expectedOutput: "true", isHidden: true },
      { input: "12321", expectedOutput: "true", isHidden: true },
      { input: "123", expectedOutput: "false", isHidden: true },
    ],
  },
  {
    title: "Binary Search",
    slug: slugify("Binary Search"),
    testCases: [
      // Public examples
      { input: "6\n-1 0 3 5 9 12\n9", expectedOutput: "4", isHidden: false },
      { input: "6\n-1 0 3 5 9 12\n2", expectedOutput: "-1", isHidden: false },
      // Hidden test cases
      { input: "1\n5\n5", expectedOutput: "0", isHidden: true },
      { input: "5\n1 3 5 7 9\n1", expectedOutput: "0", isHidden: true },
      { input: "5\n1 3 5 7 9\n9", expectedOutput: "4", isHidden: true },
      { input: "5\n1 3 5 7 9\n10", expectedOutput: "-1", isHidden: true },
      { input: "4\n2 4 6 8\n4", expectedOutput: "1", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: slugify("Valid Parentheses"),
    testCases: [
      // Public examples
      { input: "()", expectedOutput: "true", isHidden: false },
      { input: "()[]{}", expectedOutput: "true", isHidden: false },
      { input: "(]", expectedOutput: "false", isHidden: false },
      // Hidden test cases
      { input: "([)]", expectedOutput: "false", isHidden: true },
      { input: "{[]}", expectedOutput: "true", isHidden: true },
      { input: "", expectedOutput: "true", isHidden: true },
      { input: "[", expectedOutput: "false", isHidden: true },
      { input: "((()))", expectedOutput: "true", isHidden: true },
    ],
  },
];

const seedTestCases = async () => {
  await connectDB();

  // Find admin user
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error(
      "Error: Please create at least one admin user in the system first before running this seeder."
    );
    process.exit(1);
  }

  let totalInserted = 0;

  for (const problemDef of problemTestCases) {
    console.log(`\nSeeding test cases for '${problemDef.title}'...`);

    // Find the problem by slug
    let problem = await Problem.findOne({ slug: problemDef.slug });

    if (!problem) {
      console.warn(
        `  ⚠️  Problem '${problemDef.title}' not found in DB. Run problemSeeder first. Skipping.`
      );
      continue;
    }

    // Clear old test cases for this problem
    const deleted = await TestCase.deleteMany({ problemId: problem._id });
    console.log(`  Cleared ${deleted.deletedCount} old test cases.`);

    // Insert new test cases
    const docs = problemDef.testCases.map((tc) => ({
      problemId: problem._id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
    }));

    await TestCase.insertMany(docs);
    const publicCount = docs.filter((d) => !d.isHidden).length;
    const hiddenCount = docs.filter((d) => d.isHidden).length;
    console.log(
      `  ✓ Inserted ${docs.length} test cases (${publicCount} public, ${hiddenCount} hidden).`
    );
    totalInserted += docs.length;
  }

  console.log(`\n✅ Done! Seeded ${totalInserted} test cases across ${problemTestCases.length} problems.`);
};

seedTestCases()
  .catch((error) => {
    console.error("Test case seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
