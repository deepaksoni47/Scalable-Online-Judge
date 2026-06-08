const fs = require("fs");
const path = require("path");
const { runInSandbox } = require("./createContainer");

/**
 * Runs Python code inside a sandboxed container.
 * 
 * @param {string} codeFilePath - Path to the Python code file on host.
 * @param {string} inputFilePath - Path to the input file on host.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<string>} - Output from stdout.
 */
const runPythonContainer = async (codeFilePath, inputFilePath = null, timeoutMs = 2000) => {
  const jobDir = path.dirname(codeFilePath);
  const filename = path.basename(codeFilePath);
  const runShPath = path.join(jobDir, "run.sh");

  // If inputFilePath is null, use an empty temp input
  let inputPath = inputFilePath;
  let createdTempInput = false;
  if (!inputPath) {
    const generateInputFile = require("../compiler/generateInputFile");
    inputPath = await generateInputFile("");
    createdTempInput = true;
  }

  // Create run script to execute python3 inside container
  const scriptContent = `#!/bin/bash
python3 /app/src/${filename} < /app/input.txt
`.replace(/\r\n/g, "\n");

  fs.writeFileSync(runShPath, scriptContent);

  try {
    const result = await runInSandbox(jobDir, inputPath, timeoutMs);

    if (result.timedOut) {
      throw {
        errorType: "TimeLimitExceeded",
        message: "Time Limit Exceeded",
        statusCode: 400,
        containerName: result.containerName
      };
    }

    if (result.exitCode === 137) {
      throw {
        errorType: "MemoryLimitExceeded",
        message: "Memory Limit Exceeded",
        statusCode: 400,
        containerName: result.containerName
      };
    }

    if (result.exitCode !== 0) {
      throw {
        errorType: "RuntimeError",
        message: result.stderr || "Runtime Error",
        statusCode: 400,
        containerName: result.containerName
      };
    }

    console.log(`[Python Sandbox Success] Container: ${result.containerName}`);
    return result.stdout;
  } finally {
    // Delete temp input if we created one
    if (createdTempInput && fs.existsSync(inputPath)) {
      try {
        fs.unlinkSync(inputPath);
      } catch (err) {
        // ignore
      }
    }
  }
};

module.exports = runPythonContainer;
