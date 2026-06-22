import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProblemById } from "../services/problemService.js";
import { getPublicTestCases } from "../services/testCaseService.js";
import { createTestCase, deleteTestCase } from "../services/adminService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { ArrowLeft } from "lucide-react";

const AdminTestCaseManager = () => {
  const { id } = useParams(); // problemId
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // New TestCase Form State
  const [newInput, setNewInput] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newIsHidden, setNewIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setError("");
      const [problemRes, testCasesRes] = await Promise.all([
        getProblemById(id),
        getPublicTestCases(id),
      ]);
      setProblem(problemRes.data);
      setTestCases(testCasesRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to load test case data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddTestCase = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createTestCase({
        problemId: id,
        input: newInput.trim(),
        expectedOutput: newOutput.trim(),
        isHidden: newIsHidden,
      });

      // Clear Form
      setNewInput("");
      setNewOutput("");
      setNewIsHidden(false);
      alert("Test case added successfully");

      // Reload testcases
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to add testcase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (testCaseId) => {
    if (window.confirm("Are you sure you want to delete this test case?")) {
      try {
        await deleteTestCase(testCaseId);
        alert("Test case deleted successfully");
        await loadData();
      } catch (err) {
        alert("Failed to delete testcase: " + getErrorMessage(err));
      }
    }
  };

  if (isLoading) {
    return <div className="page-status">Loading testcase manager...</div>;
  }

  return (
    <section className="detail-page" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Link className="back-link" to="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "1.5rem" }}>
        <ArrowLeft size={16} />
        Back to Admin Panel
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">Configuring compilation</p>
        <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", margin: "0.25rem 0" }}>
          Test Cases: {problem?.title}
        </h1>
      </header>

      {error && <div className="alert error" style={{ marginBottom: "1.5rem" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Left Side: Create Test Case */}
        <form onSubmit={handleAddTestCase} className="auth-card" style={{ maxWidth: "100%", width: "100%", padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Add Test Case</h2>

          <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Input (stdin)</span>
            <textarea
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              placeholder="e.g. 5 10 (or multiple lines)"
              rows={4}
              disabled={isSubmitting}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </label>

          <label className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Expected Output *</span>
            <textarea
              value={newOutput}
              onChange={(e) => setNewOutput(e.target.value)}
              placeholder="Expected program output"
              required
              rows={4}
              disabled={isSubmitting}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={newIsHidden}
              onChange={(e) => setNewIsHidden(e.target.checked)}
              disabled={isSubmitting}
              style={{ width: "18px", height: "18px" }}
            />
            <span>Hidden Test Case? (Used for evaluation only, not displayed as examples)</span>
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
            style={{ width: "100%", marginTop: "0.5rem" }}
          >
            {isSubmitting ? "Adding..." : "Add Test Case"}
          </button>
        </form>

        {/* Right Side: List of Test Cases */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Existing Test Cases ({testCases.length})</h2>

          {testCases.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>No test cases set yet. Add one using the form.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "650px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {testCases.map((tc, index) => (
                <div
                  key={tc._id}
                  style={{
                    padding: "1.25rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    background: "#f8fafc",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <strong style={{ fontSize: "0.95rem" }}>Test Case #{index + 1}</strong>
                      <span
                        className={tc.isHidden ? "verdict-badge verdict-wa" : "verdict-badge verdict-accepted"}
                        style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem" }}
                      >
                        {tc.isHidden ? "Hidden" : "Public"}
                      </span>
                    </div>
                    <button
                      className="danger-button"
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", height: "auto", border: "1px solid #ef4444", color: "#ef4444", background: "transparent", borderRadius: "6px", cursor: "pointer" }}
                      onClick={() => handleDelete(tc._id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 600 }}>Input:</span>
                      <pre style={{ margin: "0.25rem 0 0 0", padding: "0.5rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflowX: "auto" }}>
                        {tc.input || "(empty)"}
                      </pre>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", fontWeight: 600 }}>Expected:</span>
                      <pre style={{ margin: "0.25rem 0 0 0", padding: "0.5rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflowX: "auto" }}>
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminTestCaseManager;
