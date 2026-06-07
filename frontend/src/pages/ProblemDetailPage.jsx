import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CompilerWorkspace from "../components/compiler/CompilerWorkspace.jsx";
import DifficultyBadge from "../components/problems/DifficultyBadge.jsx";
import TagList from "../components/problems/TagList.jsx";
import { getProblemById } from "../services/problemService.js";
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
  const [problem, setProblem] = useState(null);
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

  if (isLoading) {
    return <div className="page-status">Loading...</div>;
  }

  if (error) {
    return (
      <section className="detail-page">
        <Link className="back-link" to="/problems">
          Back to problems
        </Link>
        <div className="alert error">{error}</div>
      </section>
    );
  }

  return (
    <article className="detail-page">
      <Link className="back-link" to="/problems">
        Back to problems
      </Link>

      <header className="problem-detail-header">
        <div>
          <p className="eyebrow">Problem details</p>
          <h1>{problem.title}</h1>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
      </header>

      <TagList tags={problem.tags} />

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
        <h2>Created By</h2>
        <p>
          {problem.createdBy?.name || "Unknown"}{" "}
          {problem.createdBy?.email ? `(${problem.createdBy.email})` : ""}
        </p>
      </section>

      <CompilerWorkspace problemId={id} problem={problem} />
    </article>
  );
};

export default ProblemDetailPage;
