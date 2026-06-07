const executeCpp = require("./executeCpp");
const executeJava = require("./executeJava");
const executePython = require("./executePython");

const executeCode = async ({ language, codeFilePath, inputFilePath = null }) => {
  if (language === "cpp") {
    return executeCpp(codeFilePath, inputFilePath);
  }

  if (language === "java") {
    return executeJava(codeFilePath, inputFilePath);
  }

  if (language === "python") {
    return executePython(codeFilePath, inputFilePath);
  }

  throw {
    errorType: "ValidationError",
    message: "Unsupported language",
    statusCode: 400,
  };
};

module.exports = executeCode;
