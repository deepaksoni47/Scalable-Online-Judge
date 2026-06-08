const runCppContainer = require("../sandbox/runCppContainer");
const runPythonContainer = require("../sandbox/runPythonContainer");
const runJavaContainer = require("../sandbox/runJavaContainer");

/**
 * Route execution requests through Docker isolated containers.
 * No code execution should occur directly on the host machine.
 */
const executeCode = async ({ language, codeFilePath, inputFilePath = null }) => {
  if (language === "cpp") {
    return runCppContainer(codeFilePath, inputFilePath);
  }

  if (language === "python") {
    return runPythonContainer(codeFilePath, inputFilePath);
  }

  if (language === "java") {
    return runJavaContainer(codeFilePath, inputFilePath);
  }

  throw {
    errorType: "ValidationError",
    message: `Language "${language}" is not supported in the sandbox environment.`,
    statusCode: 400,
  };
};

module.exports = executeCode;
