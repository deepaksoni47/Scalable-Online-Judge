const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const user = await registerUser({ name, email, password, role });

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });

  return res.status(200).json(new ApiResponse(200, "Login successful", result));
});

const profile = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile fetched successfully", user));
});

module.exports = {
  register,
  login,
  profile,
};
