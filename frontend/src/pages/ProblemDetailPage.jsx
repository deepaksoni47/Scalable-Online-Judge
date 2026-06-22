import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CompilerWorkspace from "../components/compiler/CompilerWorkspace.jsx";
import DifficultyBadge from "../components/problems/DifficultyBadge.jsx";
import TagList from "../components/problems/TagList.jsx";
import { getProblemById } from "../services/problemService.js";
import { getPublicTestCases } from "../services/testCaseService.js";
import useAuth from "../hooks/useAuth.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const DetailBlock = ({ title, children }) => {
  if (!children) {
    return null;
  }

  return (
    <section className="detail-block">
      <h2>{title}</h2>
      <p>{children}</p>
    </section>
  );
};

const ProblemDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [isLoadingTestCases, setIsLoadingTestCases] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setError("");
        const response = await getProblemById(id);
        setProblem(response.data);
      } catch (apiError) {
        setError(getErrorMessage(apiError) || "Failed To Fetch Problems");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  useEffect(() => {
    const fetchTestCases = async () => {
      if (!isAuthenticated || !id) return;
      try {
        setIsLoadingTestCases(true);
        const response = await getPublicTestCases(id);
        setTestCases(response.data || []);
      } catch (err) {
        console.error("Failed to load public test cases:", err);
      } finally {
        setIsLoadingTestCases(false);
      }
    };

    fetchTestCases();
  }, [id, isAuthenticated]);

  if (isLoading) {
    return <div className="page-status">Loading...</div>;
  }

  if (error) {
    return (
      <section className="detail-page">
        <Link className="back-link" to="/problems">
          <ArrowLeft size={16} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />
          Back to problems
        </Link>
        <div className="alert error">{error}</div>
      </section>
    );
  }

  return (
    <div className="workspace-container">
      {/* Left Column: Problem Details & Description */}
      <article className="problem-description-pane">
        <Link className="back-link" to="/problems" style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
          <ArrowLeft size={16} />
          Back to problems
        </Link>

        <header className="problem-detail-header" style={{ marginBottom: "1rem" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Problem details</p>
            <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", margin: "0 0 0.5rem 0" }}>{problem.title}</h1>
          </div>
          <DifficultyBadge difficulty={problem.difficulty} />
        </header>

        <div style={{ marginBottom: "1.5rem" }}>
          <TagList tags={problem.tags} />
        </div>

        <div className="problem-details-content">
          <DetailBlock title="Statement">{problem.statement}</DetailBlock>
          <DetailBlock title="Input Format">{problem.inputFormat}</DetailBlock>
          <DetailBlock title="Output Format">{problem.outputFormat}</DetailBlock>
          <DetailBlock title="Constraints">{problem.constraints}</DetailBlock>

          <section className="detail-block">
            <h2>Examples</h2>
            {problem.examples?.length ? (
              <div className="examples-list">
                {problem.examples.map((example, index) => (
                  <div className="example-card" key={`${example.input}-${index}`}>
                    <h3>Example {index + 1}</h3>
                    <div>
                      <span>Input:</span>
                      <pre>{example.input || "Not provided"}</pre>
                    </div>
                    <div>
                      <span>Output:</span>
                      <pre>{example.output || "Not provided"}</pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span>Explanation:</span>
                        <p>{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No examples provided.</p>
            )}
          </section>

          <section className="detail-block">
            <h2>Public Test Cases</h2>
            {!isAuthenticated ? (
              <p className="auth-cta-text" style={{ margin: 0 }}>
                Please <Link to="/login">login</Link> to view public test cases for custom runs.
              </p>
            ) : isLoadingTestCases ? (
              <p>Loading test cases...</p>
            ) : testCases.length ? (
              <div className="examples-list">
                {testCases.map((tc, index) => (
                  <div className="example-card" key={tc._id || index}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0 }}>Test Case {index + 1}</h3>
                      <button
                        className="secondary-button"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem", height: "auto" }}
                        onClick={() => {
                          navigator.clipboard.writeText(tc.input);
                        }}
                        type="button"
                      >
                        Copy Input
                      </button>
                    </div>
                    <div>
                      <span>Input (raw):</span>
                      <pre>{tc.input ?? "(Empty input)"}</pre>
                    </div>
                    <div>
                      <span>Expected Output:</span>
                      <pre>{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No public test cases available.</p>
            )}
          </section>

          <section className="detail-block" style={{ borderBottom: "none" }}>
            <h2>Created By</h2>
            <p>
              {problem.createdBy?.name || "Unknown"}{" "}
              {problem.createdBy?.email ? `(${problem.createdBy.email})` : ""}
            </p>
          </section>
        </div>
      </article>

      {/* Right Column: Code Editor & Compiler Workspace */}
      <div className="compiler-pane">
        <CompilerWorkspace problemId={id} problem={problem} />
      </div>
    </div>
  );
};

export default ProblemDetailPage;
