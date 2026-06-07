/**
 * Compares actual execution output with expected output, ignoring trailing spaces on lines
 * and extra newlines at the end of the outputs.
 * 
 * @param {string} actual - The output from the code execution.
 * @param {string} expected - The expected output.
 * @returns {boolean} - True if they match, false otherwise.
 */
const compareOutput = (actual, expected) => {
  const normalize = (str) => {
    if (typeof str !== "string") {
      str = String(str || "");
    }
    return str
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trimEnd();
  };

  return normalize(actual) === normalize(expected);
};

module.exports = compareOutput;
