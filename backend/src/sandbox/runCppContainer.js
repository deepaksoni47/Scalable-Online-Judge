const fs = require("fs");
const path = require("path");
const { runInSandbox } = require("./createContainer");

/**
 * Runs C++ code inside a sandboxed container.
 * Compiles using g++ and executes.
 * 
 * @param {string} codeFilePath - Path to the C++ code file on host.
 * @param {string} inputFilePath - Path to the input file on host.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<string>} - Output from stdout.
 */
const runCppContainer = async (codeFilePath, inputFilePath = null, timeoutMs = 2000) => {
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

  // Create run script to compile and run inside container
  // We write compiled outputs to /tmp which has write permissions for sandbox user
  const scriptContent = `#!/bin/bash
g++ /app/src/${filename} -o /tmp/Main.out 2> /tmp/compile_err.txt
if [ $? -ne 0 ]; then
  cat /tmp/compile_err.txt >&2
  exit 100
fi
/tmp/Main.out < /app/input.txt
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

    if (result.exitCode === 100) {
      throw {
        errorType: "CompilationError",
        message: result.stderr || "Compilation failed",
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

    console.log(`[Cpp Sandbox Success] Container: ${result.containerName}`);
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

module.exports = runCppContainer;
