const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const runCommand = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
        ...options,
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

const executeJava = async (filePath, inputFilePath = null) => {
  const jobDir = path.dirname(filePath);
  const classFilePath = path.join(jobDir, "Main.class");

  try {
    await runCommand(`javac ${quote(filePath)}`);
  } catch (error) {
    throw {
      errorType: "CompilationError",
      message: error.stderr || error.message || "Java compilation failed",
      statusCode: 400,
    };
  }

  try {
    const inputRedirect = inputFilePath ? ` < ${quote(inputFilePath)}` : "";
    const { stdout } = await runCommand(`java Main${inputRedirect}`, {
      cwd: jobDir,
    });
    return stdout;
  } catch (error) {
    throw {
      errorType: "RuntimeError",
      message: error.stderr || error.message || "Java runtime error",
      statusCode: 400,
    };
  } finally {
    if (fs.existsSync(classFilePath)) {
      fs.unlinkSync(classFilePath);
    }
  }
};

module.exports = executeJava;
