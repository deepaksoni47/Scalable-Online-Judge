import { useState, useEffect } from "react";
import { runCode } from "../../services/compilerService.js";
import { submitSolution, getMySubmissions, getSubmissionById } from "../../services/submissionService.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import useAuth from "../../hooks/useAuth.js";
import { Link } from "react-router-dom";

const starterCode = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
    }
}
`,
  python: `a, b = map(int, input().split())
print(a + b)
`,
};

const starterInput = {
  cpp: "5 10",
  java: "5 10",
  python: "5 10",
};

const CompilerWorkspace = ({ problemId, problem }) => {
  const { isAuthenticated } = useAuth();
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCode.cpp);
  const [input, setInput] = useState(starterInput.cpp);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Submission system states
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "history"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
  const [historySubmissions, setHistorySubmissions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  
  // Selected history item modal/viewer
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Fetch submission history for this problem
  const fetchHistory = async () => {
    if (!isAuthenticated || !problemId) return;

    try {
      setIsLoadingHistory(true);
      setHistoryError("");
      const response = await getMySubmissions();
      // Filter submissions for the current problem
      const problemSubmissions = response.data.filter(
        (sub) => sub.problemId?._id === problemId || sub.problemId === problemId
      );
      setHistorySubmissions(problemSubmissions);
    } catch (err) {
      setHistoryError(getErrorMessage(err) || "Failed to load submission history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Fetch history when tab changes to "history"
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setCode(starterCode[nextLanguage]);
    setInput(starterInput[nextLanguage]);
    setOutput("");
    setError("");
    setLastSubmissionResult(null);
  };

  const handleRun = async () => {
    setOutput("");
    setError("");
    setLastSubmissionResult(null);

    if (!code.trim()) {
      setError("Code is required");
      return;
    }

    try {
      setIsRunning(true);
      const response = await runCode({ language, code, input });
      setOutput(response.output || "Program executed with no output.");
    } catch (apiError) {
      const errorType = apiError.response?.data?.errorType;
      const message = getErrorMessage(apiError);
      setError(errorType ? `${errorType}: ${message}` : message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setOutput("");
    setError("");
    setLastSubmissionResult(null);

    if (!isAuthenticated) {
      setError("Please log in to submit your solution.");
      return;
    }

    if (!code.trim()) {
      setError("Code is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitSolution({
        problemId,
        language,
        code,
      });

      setLastSubmissionResult(response.data);
      
      // Auto refresh history if they submitted successfully
      if (activeTab === "history") {
        fetchHistory();
      }
    } catch (apiError) {
      const errorType = apiError.response?.data?.errorType;
      const message = getErrorMessage(apiError);
      setError(errorType ? `${errorType}: ${message}` : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewSubmissionDetails = async (id) => {
    try {
      setIsLoadingDetail(true);
      const response = await getSubmissionById(id);
      setSelectedSubmission(response.data);
    } catch (err) {
      alert("Error loading submission details: " + getErrorMessage(err));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadSubmissionToEditor = (sub) => {
    if (window.confirm("Are you sure you want to load this code into the editor? Your current work will be overwritten.")) {
      setCode(sub.code);
      setLanguage(sub.language);
      setActiveTab("editor");
      setSelectedSubmission(null);
    }
  };

  const getVerdictClass = (verdict) => {
    switch (verdict) {
      case "Accepted":
        return "verdict-badge verdict-accepted";
      case "Wrong Answer":
        return "verdict-badge verdict-wa";
      case "Compilation Error":
        return "verdict-badge verdict-ce";
      case "Runtime Error":
        return "verdict-badge verdict-re";
      default:
        return "verdict-badge";
    }
  };

  return (
    <section className="compiler-workspace">
      {/* Tab bar header */}
      <div className="workspace-tabs">
        <button
          className={`tab-button ${activeTab === "editor" ? "active" : ""}`}
          onClick={() => setActiveTab("editor")}
          type="button"
        >
          Code Editor
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
          type="button"
        >
          Submissions History {isAuthenticated && historySubmissions.length > 0 && `(${historySubmissions.length})`}
        </button>
      </div>

      {activeTab === "editor" ? (
        <div className="editor-tab-content">
          <div className="compiler-header">
            <div>
              <p className="eyebrow">Interactive workspace</p>
              <h2>Compiler & Judge</h2>
            </div>

            <label className="compiler-language">
              <span>Language</span>
              <select value={language} onChange={handleLanguageChange} disabled={isRunning || isSubmitting}>
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
              disabled={isRunning || isSubmitting}
            />
          </label>

          <label className="program-input-label">
            <span>Custom Input (for Run)</span>
            <textarea
              className="program-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={"Optional stdin input, for example:\n5 10\nor\n5\n10"}
              spellCheck="false"
              disabled={isRunning || isSubmitting}
            />
          </label>

          <div className="action-buttons-group">
            <button
              className="secondary-button run-button"
              type="button"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>

            {isAuthenticated ? (
              <button
                className="primary-button submit-button"
                type="button"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
              >
                {isSubmitting ? "Evaluating..." : "Submit Solution"}
              </button>
            ) : (
              <div className="auth-cta-group">
                <button className="primary-button submit-button" type="button" disabled>
                  Submit Solution
                </button>
                <span className="auth-cta-text">
                  Please <Link to="/login">login</Link> to submit.
                </span>
              </div>
            )}
          </div>

          {/* Submission Verdict Result Section */}
          {lastSubmissionResult && (
            <section className="verdict-section card-fade-in">
              <div className="verdict-header-row">
                <h3>Submission Result</h3>
                <span className={getVerdictClass(lastSubmissionResult.verdict)}>
                  {lastSubmissionResult.verdict}
                </span>
              </div>

              <div className="verdict-details-grid">
                <div className="verdict-detail-item">
                  <span className="detail-label">Passed Test Cases</span>
                  <strong className="detail-value">
                    {lastSubmissionResult.passedTestCases} / {lastSubmissionResult.totalTestCases}
                  </strong>
                </div>

                <div className="verdict-detail-item">
                  <span className="detail-label">Max Execution Time</span>
                  <strong className="detail-value">
                    {lastSubmissionResult.executionTime} ms
                  </strong>
                </div>

                {lastSubmissionResult.memoryUsed > 0 && (
                  <div className="verdict-detail-item">
                    <span className="detail-label">Memory Used</span>
                    <strong className="detail-value">
                      {lastSubmissionResult.memoryUsed} KB
                    </strong>
                  </div>
                )}
              </div>

              {lastSubmissionResult.compilationError && (
                <div className="compilation-error-container">
                  <h4>Compilation Output</h4>
                  <pre className="compilation-error-text">
                    {lastSubmissionResult.compilationError}
                  </pre>
                </div>
              )}
            </section>
          )}

          {/* Custom Testing Run Output Section */}
          {(output || error) && !lastSubmissionResult && (
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
          )}
        </div>
      ) : (
        /* Submission History Tab Content */
        <div className="history-tab-content">
          {!isAuthenticated ? (
            <div className="empty-state">
              <p>You must be signed in to view your submission history.</p>
              <Link to="/login" className="primary-button" style={{ marginTop: "1rem" }}>
                Login Now
              </Link>
            </div>
          ) : isLoadingHistory ? (
            <div className="page-status">Loading submission history...</div>
          ) : historyError ? (
            <div className="alert error">{historyError}</div>
          ) : historySubmissions.length === 0 ? (
            <div className="empty-state">
              <p>You haven't submitted any solutions for this problem yet.</p>
              <button
                className="secondary-button"
                onClick={() => setActiveTab("editor")}
                style={{ marginTop: "1rem" }}
              >
                Write Code
              </button>
            </div>
          ) : (
            <div className="history-list">
              <h3>Your Past Submissions</h3>
              <div className="submission-history-grid">
                {historySubmissions.map((sub) => (
                  <div
                    key={sub.submissionId}
                    className="submission-history-card"
                    onClick={() => viewSubmissionDetails(sub.submissionId)}
                  >
                    <div className="history-card-header">
                      <span className={getVerdictClass(sub.verdict)}>{sub.verdict}</span>
                      <span className="history-date">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="history-card-details">
                      <div>
                        Language: <strong>{sub.language.toUpperCase()}</strong>
                      </div>
                      <div>
                        ID: <span className="mono">{sub.submissionId.slice(-6)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Submission Viewer Modal/Overlay */}
          {selectedSubmission && (
            <div className="submission-detail-overlay">
              <div className="submission-detail-modal">
                <header className="modal-header">
                  <h3>Submission Details</h3>
                  <button
                    className="close-button"
                    onClick={() => setSelectedSubmission(null)}
                    type="button"
                  >
                    &times;
                  </button>
                </header>

                <div className="modal-body">
                  <div className="modal-meta-grid">
                    <div>
                      <span>Verdict</span>
                      <strong className={getVerdictClass(selectedSubmission.verdict)}>
                        {selectedSubmission.verdict}
                      </strong>
                    </div>
                    <div>
                      <span>Language</span>
                      <strong>{selectedSubmission.language.toUpperCase()}</strong>
                    </div>
                    <div>
                      <span>Passed Test Cases</span>
                      <strong>
                        {selectedSubmission.passedTestCases} / {selectedSubmission.totalTestCases}
                      </strong>
                    </div>
                    <div>
                      <span>Execution Time</span>
                      <strong>{selectedSubmission.executionTime} ms</strong>
                    </div>
                    <div>
                      <span>Submitted At</span>
                      <strong>{new Date(selectedSubmission.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>

                  {selectedSubmission.verdict === "Compilation Error" && selectedSubmission.code && (
                    <div className="compilation-error-container" style={{ marginTop: "1rem" }}>
                      <h4>Compilation Log</h4>
                      <pre className="compilation-error-text">
                        {/* If compilation log is not stored on the main document, check if we stored it */}
                        {selectedSubmission.compilationError || "Compiler returned compilation errors during execution."}
                      </pre>
                    </div>
                  )}

                  <div className="modal-code-section">
                    <div className="code-header-row">
                      <h4>Submitted Code</h4>
                      <button
                        className="secondary-button btn-small"
                        onClick={() => loadSubmissionToEditor(selectedSubmission)}
                        type="button"
                      >
                        Load Into Editor
                      </button>
                    </div>
                    <pre className="modal-code-display">{selectedSubmission.code}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CompilerWorkspace;
