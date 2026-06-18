import apiClient from "../api/axiosInstance.js";

export const getLeaderboard = async ({ page = 1, limit = 20, sortBy, order } = {}) => {
  const response = await apiClient.get("/leaderboard", {
    params: {
      page,
      limit,
      sortBy,
      order,
    },
  });
  return response.data;
};

export const getMyStats = async () => {
  const response = await apiClient.get("/stats/me");
  return response.data;
};

export const getPublicUserStats = async (userId) => {
  const response = await apiClient.get(`/stats/user/${userId}`);
  return response.data;
};
