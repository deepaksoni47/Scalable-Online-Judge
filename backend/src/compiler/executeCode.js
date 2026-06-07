const executeCpp = require("./executeCpp");
const executeJava = require("./executeJava");
const executePython = require("./executePython");

const executeCode = async ({ language, filePath }) => {
  if (language === "cpp") {
    return executeCpp(filePath);
  }

  if (language === "java") {
    return executeJava(filePath);
  }

  if (language === "python") {
    return executePython(filePath);
  }

  throw {
    errorType: "ValidationError",
    message: "Unsupported language",
    statusCode: 400,
  };
};

module.exports = executeCode;
