const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

/**
 * Core utility to run commands in the docker sandbox.
 * 
 * @param {string} jobDir - Directory where code and run.sh are located.
 * @param {string} inputFilePath - Path to the input file.
 * @param {number} timeoutMs - Execution timeout limit.
 * @returns {Promise<object>} - Result containing stdout, stderr, exitCode, timedOut.
 */
const runInSandbox = (jobDir, inputFilePath, timeoutMs = 2000) => {
  return new Promise((resolve) => {
    const containerName = `oj-sandbox-${uuidv4()}`;

    // Mounts config
    const runShPath = path.join(jobDir, "run.sh");
    
    // Commands to mount:
    // Mount jobDir to /app/src
    // Mount inputFilePath to /app/input.txt (read-only)
    const dockerCmd = `docker run --name ${containerName} --rm --cpus=1 --memory=256m --memory-swap=256m --pids-limit=30 --network=none -v "${jobDir}:/app/src" -v "${inputFilePath}:/app/input.txt:ro" oj-sandbox bash /app/src/run.sh`;

    let isTimedOut = false;
    let timer;

    console.log(`[Sandbox] Creating container ${containerName} for job in ${jobDir}`);

    const child = exec(dockerCmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (timer) clearTimeout(timer);

      if (isTimedOut) {
        return resolve({
          containerName,
          timedOut: true,
          stdout: "",
          stderr: "Time Limit Exceeded",
          exitCode: 124, // standard timeout exit code
        });
      }

      const exitCode = error ? error.code : 0;
      resolve({
        containerName,
        timedOut: false,
        stdout,
        stderr,
        exitCode,
      });
    });

    timer = setTimeout(() => {
      isTimedOut = true;
      child.kill("SIGTERM");
      
      // Force kill the container to ensure it stops running
      console.log(`[Sandbox] Job timed out. Killing container ${containerName}`);
      exec(`docker kill ${containerName}`, (err) => {
        if (err) {
          console.error(`[Sandbox] Failed to kill container ${containerName}:`, err.message);
        }
      });
    }, timeoutMs);
  });
};

module.exports = { runInSandbox };
