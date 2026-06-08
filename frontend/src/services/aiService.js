import apiClient from "../api/axiosInstance.js";

/**
 * Request an AI review for the given code.
 */
export const requestAIReview = async ({ problemId, code, language }) => {
  const response = await apiClient.post("/ai/review", {
    problemId,
    code,
    language,
  });
  return response.data;
};

/**
 * Fetch all AI reviews for the current user.
 */
export const getAIReviewHistory = async () => {
  const response = await apiClient.get("/ai/reviews");
  return response.data;
};
