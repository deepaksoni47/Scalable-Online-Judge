const fs = require("fs");
const path = require("path");

const inputsDir = path.join(__dirname, "../../inputs");

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const generateInputFile = async (input = "") => {
  ensureDirectory(inputsDir);

  const { v4: uuid } = await import("uuid");
  const filePath = path.join(inputsDir, `${uuid()}.txt`);

  fs.writeFileSync(filePath, input ?? "");

  return filePath;
};

module.exports = generateInputFile;
