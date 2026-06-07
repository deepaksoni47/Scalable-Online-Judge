import apiClient from "../api/axiosInstance.js";

export const getProblems = async () => {
  const response = await apiClient.get("/problems", {
    params: {
      limit: 50,
    },
  });

  return response.data;
};

export const getProblemById = async (problemId) => {
  const response = await apiClient.get(`/problems/${problemId}`);
  return response.data;
};
