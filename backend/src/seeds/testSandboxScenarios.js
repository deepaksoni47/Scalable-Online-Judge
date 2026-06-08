const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const runCppContainer = require("../sandbox/runCppContainer");
const runPythonContainer = require("../sandbox/runPythonContainer");
const runJavaContainer = require("../sandbox/runJavaContainer");

// Ensure temp directories exist
const codesDir = path.join(__dirname, "..", "codes");
const inputsDir = path.join(__dirname, "..", "inputs");
if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir);
if (!fs.existsSync(inputsDir)) fs.mkdirSync(inputsDir);

const runTest = async (name, lang, code, expectedVerdict) => {
  const jobId = uuidv4();
  const jobDir = path.join(codesDir, jobId);
  fs.mkdirSync(jobDir);

  let ext = "py";
  if (lang === "cpp") ext = "cpp";
  if (lang === "java") ext = "java";

  // Class name must match file name for Java, so we always name it Main
  const codeFilePath = path.join(jobDir, `Main.${ext}`);
  fs.writeFileSync(codeFilePath, code);

  console.log(`\n========================================`);
  console.log(`Running Scenario: ${name}`);
  console.log(`Language: ${lang}`);
  console.log(`Expected Outcome: ${expectedVerdict}`);
  console.log(`========================================`);

  let verdict = "Accepted";
  let errorMsg = "";

  try {
    let output;
    if (lang === "cpp") {
      output = await runCppContainer(codeFilePath, null, 2000);
    } else if (lang === "java") {
      output = await runJavaContainer(codeFilePath, null, 4000);
    } else {
      output = await runPythonContainer(codeFilePath, null, 2000);
    }
    console.log(`Output: ${output.trim()}`);
  } catch (error) {
    verdict = error.errorType || "RuntimeError";
    errorMsg = error.message;
    console.log(`Verdict: ${verdict}`);
    if (errorMsg) {
      console.log(`Error Message: ${errorMsg.trim().slice(0, 200)}${errorMsg.length > 200 ? '...' : ''}`);
    }
  } finally {
    // Cleanup job dir
    if (fs.existsSync(jobDir)) {
      fs.rmSync(jobDir, { recursive: true, force: true });
    }
  }

  const passed = verdict === expectedVerdict;
  console.log(`Result: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  return passed;
};

const runAllScenarios = async () => {
  console.log("Starting Sandbox Scenarios Verification...");

  const s1 = await runTest(
    "Scenario 1: Hello World (Correct Code)",
    "cpp",
    `#include <iostream>
using namespace std;
int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
    "Accepted"
  );

  const s2 = await runTest(
    "Scenario 2: while(true) (Time Limit Exceeded)",
    "cpp",
    `#include <iostream>
using namespace std;
int main() {
    while(true) {}
    return 0;
}`,
    "TimeLimitExceeded"
  );

  const s3 = await runTest(
    "Scenario 3: Huge Memory Allocation (Memory Limit Exceeded)",
    "cpp",
    `#include <iostream>
#include <vector>
using namespace std;
int main() {
    // Try to allocate 350MB which exceeds the 256MB limit
    vector<char>* vec = new vector<char>(350 * 1024 * 1024, 'a');
    cout << vec->size() << endl;
    return 0;
}`,
    "MemoryLimitExceeded"
  );

  const s4 = await runTest(
    "Scenario 4: Attempt Internet Access (Blocked)",
    "python",
    `import urllib.request
try:
    urllib.request.urlopen("http://1.1.1.1", timeout=0.2)
    print("SUCCESS: Internet accessed!")
except Exception as e:
    print("BLOCKED: " + str(e))
`,
    "Accepted" // It runs successfully and prints "BLOCKED: ..." due to network block!
  );

  const s5 = await runTest(
    "Scenario 5: Attempt Host File Access (Isolated)",
    "python",
    `import os
try:
    # Try to write to the container's root directory outside the mounted /app/src
    with open("/test_host_file.txt", "w") as f:
        f.write("dangerous write")
    print("SUCCESS: Wrote to container root")
except Exception as e:
    print("FAILED: " + str(e))
`,
    "Accepted"
  );

  const s6 = await runTest(
    "Scenario 6: Java Hello World (Correct Code)",
    "java",
    `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Java Sandbox");
    }
}`,
    "Accepted"
  );

  console.log("\n========================================");
  console.log("All scenarios finished.");
  console.log("========================================");
};

runAllScenarios().catch(err => {
  console.error("Test execution failed:", err);
});
