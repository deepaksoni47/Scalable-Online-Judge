const fs = require("fs");
const path = require("path");

const extensionMap = {
  cpp: "cpp",
  java: "java",
  python: "py",
};

const codesDir = path.join(__dirname, "../../codes");

const ensureDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const generateFile = async ({ language, code }) => {
  const extension = extensionMap[language];

  if (!extension) {
    throw new Error("Unsupported language");
  }

  ensureDirectory(codesDir);

  const { v4: uuid } = await import("uuid");
  const jobId = uuid();
  const jobDir = path.join(codesDir, jobId);
  ensureDirectory(jobDir);

  const fileName = language === "java" ? "Main.java" : `${jobId}.${extension}`;
  const filePath = path.join(jobDir, fileName);

  fs.writeFileSync(filePath, code);

  return filePath;
};

module.exports = generateFile;
