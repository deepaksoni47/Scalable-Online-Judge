import apiClient from "../api/axiosInstance.js";

export const getPublicTestCases = async (problemId) => {
  const response = await apiClient.get(`/testcases/problem/${problemId}`);
  return response.data;
};
