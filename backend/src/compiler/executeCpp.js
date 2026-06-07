const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const outputsDir = path.join(__dirname, "../../outputs");

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      },
      (error, stdout, stderr) => {
        if (error) {
          error.stderr = stderr;
          error.stdout = stdout;
          return reject(error);
        }

        return resolve({ stdout, stderr });
      },
    );
  });
};

const quote = (value) => `"${value}"`;

const executeCpp = async (filePath) => {
  ensureDirectory(outputsDir);

  const jobId = path.basename(filePath, path.extname(filePath));
  const executablePath = path.join(outputsDir, `${jobId}.exe`);
  const compileCommand = `g++ ${quote(filePath)} -o ${quote(executablePath)}`;

  try {
    await runCommand(compileCommand);
  } catch (error) {
    throw {
      errorType: "CompilationError",
      message: error.stderr || error.message || "Compilation failed",
      statusCode: 400,
    };
  }

  try {
    const runExecutableCommand = `cd /d ${quote(outputsDir)} && ${quote(`.\\${path.basename(executablePath)}`)}`;
    const { stdout } = await runCommand(runExecutableCommand);
    return stdout;
  } catch (error) {
    throw {
      errorType: "RuntimeError",
      message: error.stderr || error.message || "Runtime error",
      statusCode: 400,
    };
  } finally {
    if (fs.existsSync(executablePath)) {
      fs.unlinkSync(executablePath);
    }
  }
};

module.exports = executeCpp;
