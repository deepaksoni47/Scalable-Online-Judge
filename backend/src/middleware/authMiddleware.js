const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  // Expect a standard Bearer token header.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token is required");
  }

  const token = authorization.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  // Fail fast for invalid or expired tokens.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User not found for this token");
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

module.exports = { protect };
