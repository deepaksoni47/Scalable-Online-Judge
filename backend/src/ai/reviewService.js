const { getGeminiClient } = require("./geminiClient");
const { buildReviewPrompt } = require("./reviewPrompt");
const AIReview = require("../models/AIReview");
const Problem = require("../models/Problem");
const ApiError = require("../utils/ApiError");

/**
 * Service to manage AI reviews.
 */
const getOrGenerateReview = async ({ userId, problemId, code, language }) => {
  if (!code || !code.trim()) {
    throw new ApiError(400, "Code content is required");
  }

  // 1. Fetch the problem to verify existence and get the statement/constraints.
  const problem = await Problem.findById(problemId);
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  const normalizedCode = code.trim();

  // 2. Cache Check (Cost Optimization & Avoiding Duplicate Calls):
  // Check if this exact code for this problem and language has been reviewed before by anyone.
  const existingReview = await AIReview.findOne({
    problemId,
    language,
    code: normalizedCode,
  });

  if (existingReview) {
    console.log(`[AI Review] Cache Hit for problem ${problemId} (${language}).`);
    
    // If it exists but was reviewed by another user, we can associate a copy for the current user's history,
    // or we can check if there's a record specifically for this user.
    // To ensure the current user sees it in their history, we check if they have a history entry.
    const userHasReview = await AIReview.findOne({
      userId,
      problemId,
      language,
      code: normalizedCode,
    });

    if (!userHasReview) {
      // Create a copy for this user's history so it appears in their personal history list,
      // without calling Gemini again.
      const copiedReview = await AIReview.create({
        userId,
        problemId,
        language,
        code: normalizedCode,
        review: existingReview.review,
      });
      return { review: copiedReview.review, cached: true };
    }

    return { review: existingReview.review, cached: true };
  }

  // 3. Cache Miss: Call Gemini API
  console.log(`[AI Review] Cache Miss. Invoking Gemini API for problem ${problemId}...`);
  
  let genAI;
  try {
    genAI = getGeminiClient();
  } catch (err) {
    if (err.message === "GEMINI_API_KEY_MISSING") {
      throw new ApiError(500, "Google Gemini API key is missing on the server. Please configure GEMINI_API_KEY in the environment.");
    }
    throw err;
  }

  // Build structured prompt
  const prompt = buildReviewPrompt({ problem, code: normalizedCode, language });

  try {
    // Using gemini-1.5-flash for fast, optimized responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText = response.text();

    if (!reviewText) {
      throw new ApiError(502, "Gemini failed to generate a review");
    }

    // 4. Save review to history/cache
    const savedReview = await AIReview.create({
      userId,
      problemId,
      language,
      code: normalizedCode,
      review: reviewText,
    });

    return { review: savedReview.review, cached: false };
  } catch (error) {
    console.error("[AI Review Error]:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, `Failed to generate review from Gemini: ${error.message}`);
  }
};

/**
 * Service to fetch review history for a user.
 */
const getUserReviewHistory = async (userId) => {
  return await AIReview.find({ userId })
    .populate("problemId", "title difficulty")
    .sort({ createdAt: -1 });
};

module.exports = {
  getOrGenerateReview,
  getUserReviewHistory,
};
