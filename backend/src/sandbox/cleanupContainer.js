const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Clean up files, directories, and running containers.
 * 
 * @param {string} containerName - The name of the docker container to kill and remove.
 * @param {string} jobDir - The temporary job directory to delete.
 * @param {string} inputFilePath - The temporary input file to delete.
 */
const cleanupSandbox = (containerName, jobDir, inputFilePath) => {
  // 1. Force kill container in background just in case it didn't terminate
  if (containerName) {
    exec(`docker rm -f ${containerName}`, (err) => {
      // Ignore errors if container is already gone (which it should be due to --rm)
    });
  }

  // 2. Clean up job directory
  if (jobDir && fs.existsSync(jobDir)) {
    try {
      fs.rmSync(jobDir, { recursive: true, force: true });
      console.log(`[Sandbox Cleanup] Removed job directory: ${jobDir}`);
    } catch (err) {
      console.error(`[Sandbox Cleanup] Error removing job directory ${jobDir}:`, err.message);
    }
  }

  // 3. Clean up input file
  if (inputFilePath && fs.existsSync(inputFilePath)) {
    try {
      fs.unlinkSync(inputFilePath);
      console.log(`[Sandbox Cleanup] Removed input file: ${inputFilePath}`);
    } catch (err) {
      console.error(`[Sandbox Cleanup] Error removing input file ${inputFilePath}:`, err.message);
    }
  }
};

module.exports = { cleanupSandbox };
