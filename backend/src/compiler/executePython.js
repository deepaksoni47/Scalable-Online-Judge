const { exec } = require("child_process");

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

const executePython = async (filePath) => {
  const pythonCommand = process.env.PYTHON_BIN || "python";

  try {
    const { stdout } = await runCommand(`${pythonCommand} ${quote(filePath)}`);
    return stdout;
  } catch (error) {
    throw {
      errorType: "RuntimeError",
      message: error.stderr || error.message || "Python execution failed",
      statusCode: 400,
    };
  }
};

module.exports = executePython;
