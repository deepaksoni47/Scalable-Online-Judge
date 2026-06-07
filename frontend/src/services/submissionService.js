import apiClient from "../api/axiosInstance.js";

export const submitSolution = async ({ problemId, language, code }) => {
  const response = await apiClient.post("/submissions/submit", {
    problemId,
    language,
    code,
  });
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await apiClient.get("/submissions/my");
  return response.data;
};

export const getSubmissionById = async (id) => {
  const response = await apiClient.get(`/submissions/${id}`);
  return response.data;
};
