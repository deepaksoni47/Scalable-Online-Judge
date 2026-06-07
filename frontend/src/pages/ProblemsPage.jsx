import { useEffect, useState } from "react";
import ProblemCard from "../components/problems/ProblemCard.jsx";
import SearchBar from "../components/problems/SearchBar.jsx";
import TagList from "../components/problems/TagList.jsx";
import { getProblems } from "../services/problemService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const defaultTags = ["array", "string", "math", "binary-search", "stack", "graph"];
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
    <section className="problems-page">
      <div className="section-header">
        <p className="eyebrow">Problem set</p>
        <h1>Choose a coding problem</h1>
        <p>
          Browse published problems, filter by difficulty or tag, and open the
          full statement when you are ready.
        </p>
      </div>

      <div className="problem-filters">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <label className="filter-control">
          <span>Difficulty</span>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            {difficulties.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tag-filter-panel">
        <div className="filter-label-row">
          <span>Filter by tag</span>
          {selectedTag && (
            <button
              className="clear-filter-button"
              type="button"
              onClick={() => setSelectedTag("")}
            >
              Clear
            </button>
          )}
        </div>
        <TagList
          tags={availableTags}
          selectedTag={selectedTag}
          onTagClick={setSelectedTag}
        />
      </div>

      {isLoading && <div className="page-status">Loading...</div>}
      {error && !isLoading && <div className="alert error">{error}</div>}
      {!error && !isLoading && filteredProblems.length === 0 && (
        <div className="empty-state">No Problems Found</div>
      )}

      {!error && !isLoading && filteredProblems.length > 0 && (
        <div className="problem-list">
          {filteredProblems.map((problem) => (
            <ProblemCard key={problem._id} problem={problem} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProblemsPage;
