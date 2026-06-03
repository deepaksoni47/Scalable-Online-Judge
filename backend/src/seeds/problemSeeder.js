require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Problem = require("../models/Problem");
const User = require("../models/User");
const slugify = require("../utils/slugify");

const sampleProblems = [
  {
    title: "Two Sum",
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    tags: ["array", "hash-table"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] equals 9.",
      },
    ],
  },
  {
    title: "Reverse String",
    statement:
      "Write a function that reverses a string. The input string is given as an array of characters.",
    difficulty: "Easy",
    tags: ["string", "two-pointers"],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "Reverse the characters in-place.",
      },
    ],
  },
  {
    title: "Palindrome Number",
    statement:
      "Given an integer x, return true if x is a palindrome, and false otherwise.",
    difficulty: "Easy",
    tags: ["math"],
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads the same from left to right and right to left.",
      },
    ],
  },
  {
    title: "Binary Search",
    statement:
      "Given a sorted array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.",
    difficulty: "Easy",
    tags: ["array", "binary-search"],
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums at index 4.",
      },
    ],
  },
  {
    title: "Valid Parentheses",
    statement:
      "Given a string s containing parentheses characters, determine if the input string is valid.",
    difficulty: "Easy",
    tags: ["string", "stack"],
    examples: [
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "Every opening bracket is closed in the correct order.",
      },
    ],
  },
];

const seedProblems = async () => {
  await connectDB();

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    throw new Error("Create at least one admin user before seeding problems");
  }

  const problems = sampleProblems.map((problem) => ({
    ...problem,
    slug: slugify(problem.title),
    createdBy: admin._id,
    isPublished: true,
  }));

  await Problem.deleteMany({
    slug: { $in: problems.map((problem) => problem.slug) },
  });
  await Problem.insertMany(problems);

  console.log("Seeded 5 sample problems successfully");
};

seedProblems()
  .catch((error) => {
    console.error("Problem seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
