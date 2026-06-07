const fs = require("fs");
const path = require("path");
const generateFile = require("../compiler/generateFile");
const executeCode = require("../compiler/executeCode");
const asyncHandler = require("../utils/asyncHandler");

const supportedLanguages = ["cpp", "java", "python"];

const validateRunRequest = ({ language, code }) => {
  if (!language) {
    return "Language is required";
  }

  if (!supportedLanguages.includes(language)) {
    return "Supported languages are cpp, java and python";
  }

  if (!code || !code.trim()) {
    return "Code is required";
  }

  return "";
};

const runCode = asyncHandler(async (req, res) => {
  const { language, code } = req.body;
  const validationError = validateRunRequest({ language, code });

  if (validationError) {
    return res.status(400).json({
      success: false,
      errorType: "ValidationError",
      message: validationError,
    });
  }

  let filePath;

  try {
    filePath = await generateFile({ language, code });
    const output = await executeCode({ language, filePath });

    return res.status(200).json({
      success: true,
      output,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      errorType: error.errorType || "InternalServerError",
      message: error.message || "Internal Server Error",
    });
  } finally {
    if (filePath) {
      const jobDir = path.dirname(filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    }
  }
});

module.exports = {
  runCode,
};
