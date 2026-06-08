import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DifficultyBadge from "../components/problems/DifficultyBadge.jsx";
import TagList from "../components/problems/TagList.jsx";
import SearchBar from "../components/problems/SearchBar.jsx";
import { getProblems } from "../services/problemService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const defaultTags = ["array", "string", "math", "binary-search", "stack", "graph", "basic", "hash-table"];
const difficulties = ["All", "Easy", "Medium", "Hard"];

const normalizeText = (value) => value.toLowerCase().trim();

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setError("");
        const response = await getProblems();
        setProblems(response.data?.problems || []);
      } catch (apiError) {
        setError(getErrorMessage(apiError) || "Failed To Fetch Problems");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const availableTags = Array.from(
    new Set([...defaultTags, ...problems.flatMap((problem) => problem.tags || [])]),
  );

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = normalizeText(problem.title || "").includes(
      normalizeText(searchTerm),
    );
    const matchesDifficulty =
      difficulty === "All" || problem.difficulty === difficulty;
    const matchesTag = !selectedTag || problem.tags?.includes(selectedTag);

    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <section className="problems-page-container">
      <header className="problems-hero">
        <div className="hero-content">
          <p className="eyebrow">Problem Set</p>
          <h1>Practice & Master Your Coding Skills</h1>
          <p className="hero-subtext">
            Choose from our curated library of coding challenges. Review your correctness, verify constraints, and get instant Gemini AI reviews to level up.
          </p>
        </div>
      </header>

      {/* Filter Row: Compact LeetCode-style search and dropdown */}
      <div className="filters-container">
        <div className="search-filter-wrapper">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          
          <div className="dropdown-filter">
            <span className="dropdown-label">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="filter-select"
            >
              {difficulties.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag Filters list */}
        <div className="tag-filter-row">
          <span className="tag-label">Tags:</span>
          <div className="tag-pills">
            <button
              className={`tag-chip ${!selectedTag ? "selected" : ""}`}
              onClick={() => setSelectedTag("")}
              type="button"
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTag === tag ? "selected" : ""}`}
                onClick={() => setSelectedTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="page-status" style={{ padding: "4rem 0" }}>
          <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
          <p>Loading problem set...</p>
        </div>
      ) : error ? (
        <div className="alert error">{error}</div>
      ) : filteredProblems.length === 0 ? (
        <div className="empty-state" style={{ padding: "5rem 2rem" }}>
          <span style={{ fontSize: "2.5rem" }}>🔍</span>
          <h3 style={{ margin: "1rem 0 0.5rem 0" }}>No Problems Found</h3>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            Try adjusting your search terms or filters to find problems.
          </p>
        </div>
      ) : (
        <div className="table-responsive card-fade-in">
          <table className="problems-table">
            <thead>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>Status</th>
                <th>Title</th>
                <th style={{ width: "160px" }}>Difficulty</th>
                <th>Tags</th>
                <th style={{ width: "120px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem, idx) => (
                <tr key={problem._id}>
                  <td style={{ textAlign: "center", color: "#667085" }}>
                    {idx + 1}
                  </td>
                  <td>
                    <Link className="problem-link-title" to={`/problems/${problem._id}`}>
                      {problem.title}
                    </Link>
                  </td>
                  <td>
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.40rem", flexWrap: "wrap" }}>
                      {problem.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="tag-chip-small">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link className="solve-action-btn" to={`/problems/${problem._id}`}>
                      Solve
                    </Link>
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

export default ProblemsPage;
