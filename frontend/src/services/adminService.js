import apiClient from "../api/axiosInstance.js";

// Problem management
export const createProblem = async (problemData) => {
  const response = await apiClient.post("/problems", problemData);
  return response.data;
};

export const updateProblem = async (id, problemData) => {
  const response = await apiClient.put(`/problems/${id}`, problemData);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await apiClient.delete(`/problems/${id}`);
  return response.data;
};

// TestCase management
export const createTestCase = async (testCaseData) => {
  const response = await apiClient.post("/testcases", testCaseData);
  return response.data;
};

export const deleteTestCase = async (id) => {
  const response = await apiClient.delete(`/testcases/${id}`);
  return response.data;
};
