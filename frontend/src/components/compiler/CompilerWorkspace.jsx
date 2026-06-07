import { useState } from "react";
import { runCode } from "../../services/compilerService.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const starterCode = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,
  python: `print("Hello World")
`,
};

const CompilerWorkspace = () => {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setCode(starterCode[nextLanguage]);
    setOutput("");
    setError("");
  };

  const handleRun = async () => {
    setOutput("");
    setError("");

    if (!code.trim()) {
      setError("Code is required");
      return;
    }

    try {
      setIsRunning(true);
      const response = await runCode({ language, code });
      setOutput(response.output || "Program executed with no output.");
    } catch (apiError) {
      const errorType = apiError.response?.data?.errorType;
      const message = getErrorMessage(apiError);
      setError(errorType ? `${errorType}: ${message}` : message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="compiler-workspace">
      <div className="compiler-header">
        <div>
          <p className="eyebrow">Run code</p>
          <h2>Compiler Workspace</h2>
        </div>

        <label className="compiler-language">
          <span>Language</span>
          <select value={language} onChange={handleLanguageChange}>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </label>
      </div>

      <label className="code-editor-label">
        <span>Code Editor</span>
        <textarea
          className="code-editor"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck="false"
        />
      </label>

      <button
        className="primary-button run-button"
        type="button"
        onClick={handleRun}
        disabled={isRunning}
      >
        {isRunning ? "Running..." : "Run"}
      </button>

      <section className="output-section">
        <h3>Output</h3>
        {error ? (
          <pre className="compiler-output error-output">{error}</pre>
        ) : (
          <pre className="compiler-output">
            {output || "Run your code to see output here."}
          </pre>
        )}
      </section>
    </section>
  );
};

export default CompilerWorkspace;
