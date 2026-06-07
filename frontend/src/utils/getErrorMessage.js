export const getErrorMessage = (error) => {
  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  return error.response.data?.message || "Something went wrong. Please try again.";
};
