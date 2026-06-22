import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProblems } from "../services/problemService.js";
import { deleteProblem } from "../services/adminService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import DifficultyBadge from "../components/problems/DifficultyBadge.jsx";

const AdminDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      setError("");
      const response = await getProblems();
      setProblems(response.data?.problems || []);
    } catch (apiError) {
      setError(getErrorMessage(apiError) || "Failed to fetch problems");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the problem "${title}"?`)) {
      try {
        await deleteProblem(id);
        alert("Problem deleted successfully");
        fetchProblems();
      } catch (err) {
        alert("Failed to delete problem: " + getErrorMessage(err));
      }
    }
  };

  return (
    <section className="problems-page-container">
      <header className="problems-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
        <div className="hero-content" style={{ flex: "1 1 300px" }}>
          <p className="eyebrow">Admin Console</p>
          <h1>Problem & Test Case Management</h1>
          <p className="hero-subtext" style={{ maxWidth: "600px" }}>
            Add, update, or remove coding challenges. You can also configure the exact inputs and expected outputs for compilation.
          </p>
        </div>
        <div>
          <Link to="/admin/problems/new" className="primary-button" style={{ display: "inline-block", textDecoration: "none" }}>
            + Create New Problem
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="page-status" style={{ padding: "4rem 0" }}>
          <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
          <p>Loading problems...</p>
        </div>
      ) : error ? (
        <div className="alert error">{error}</div>
      ) : problems.length === 0 ? (
        <div className="empty-state" style={{ padding: "5rem 2rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>No Problems Found</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Get started by creating your first coding problem.
          </p>
          <Link to="/admin/problems/new" className="primary-button">
            Create Problem
          </Link>
        </div>
      ) : (
        <div className="table-responsive card-fade-in" style={{ marginTop: "2rem" }}>
          <table className="problems-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th style={{ width: "300px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td>
                    <Link className="problem-link-title" to={`/problems/${problem._id}`} style={{ fontWeight: 600 }}>
                      {problem.title}
                    </Link>
                  </td>
                  <td>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.40rem", flexWrap: "wrap" }}>
                      {problem.tags?.map((t) => (
                        <span key={t} className="tag-chip-small">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <Link
                        className="secondary-button"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none", height: "auto" }}
                        to={`/admin/problems/${problem._id}/testcases`}
                      >
                        Test Cases
                      </Link>
                      <Link
                        className="secondary-button"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none", height: "auto" }}
                        to={`/admin/problems/${problem._id}/edit`}
                      >
                        Edit
                      </Link>
                      <button
                        className="danger-button"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto", border: "1px solid #ef4444", color: "#ef4444", background: "transparent", borderRadius: "10px", cursor: "pointer" }}
                        onClick={() => handleDelete(problem._id, problem.title)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
