const fs = require("fs");
const path = require("path");
const { runInSandbox } = require("./createContainer");

/**
 * Runs Java code inside a sandboxed container.
 * Compiles using javac and executes using java.
 * 
 * @param {string} codeFilePath - Path to the Java code file on host.
 * @param {string} inputFilePath - Path to the input file on host.
 * @param {number} timeoutMs - Timeout in milliseconds. Defaults to 4000ms due to JVM boot overhead.
 * @returns {Promise<string>} - Output from stdout.
 */
const runJavaContainer = async (codeFilePath, inputFilePath = null, timeoutMs = 4000) => {
  const jobDir = path.dirname(codeFilePath);
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
  // Class output goes to /tmp to avoid root directory write permission blocks
  // Enforces 128m maximum heap limit for JVM execution to fit in 256MB container RAM
  const scriptContent = `#!/bin/bash
javac -d /tmp /app/src/Main.java 2> /tmp/compile_err.txt
if [ $? -ne 0 ]; then
  cat /tmp/compile_err.txt >&2
  exit 100
fi
java -Xmx128m -cp /tmp Main < /app/input.txt
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

    console.log(`[Java Sandbox Success] Container: ${result.containerName}`);
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

module.exports = runJavaContainer;
