import { useEffect, useMemo, useState } from "react";
import { getLeaderboard } from "../services/statsService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const sortOptions = [
  { label: "Solved Problems", value: "solvedProblems", order: "desc" },
  { label: "Accepted Submissions", value: "acceptedSubmissions", order: "desc" },
  { label: "Average Time", value: "averageExecutionTime", order: "asc" },
  { label: "Acceptance Rate", value: "acceptanceRate", order: "desc" },
];

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
  const [sortBy, setSortBy] = useState("solvedProblems");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedSort = useMemo(
    () => sortOptions.find((option) => option.value === sortBy) || sortOptions[0],
    [sortBy],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getLeaderboard({
          page: pagination.page,
          limit: pagination.limit,
          sortBy: selectedSort.value,
          order: selectedSort.order,
        });

        if (isMounted) {
          setLeaderboard(response.data.leaderboard || []);
          setPagination(response.data.pagination || { page: 1, limit: 20, totalPages: 1 });
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [pagination.page, pagination.limit, selectedSort]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPagination((current) => ({ ...current, page: 1 }));
  };

  return (
    <section className="analytics-page">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Rankings</p>
          <h1>Leaderboard</h1>
        </div>

        <label className="analytics-control">
          Sort by
          <select value={sortBy} onChange={handleSortChange}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <div className="alert error">{error}</div> : null}

      <div className="analytics-table-shell">
        {isLoading ? (
          <p className="page-status">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="empty-state">No ranked users yet.</p>
        ) : (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Solved Problems</th>
                <th>Accepted</th>
                <th>Acceptance Rate</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => (
                <tr key={user.userId}>
                  <td className="rank-cell">#{user.rank}</td>
                  <td>{user.username}</td>
                  <td>{user.solvedProblems}</td>
                  <td>{user.acceptedSubmissions}</td>
                  <td>{user.acceptanceRate}%</td>
                  <td>
                    <span className={`rank-badge ${user.badge.toLowerCase()}`}>{user.badge}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="pagination-row">
        <button
          className="secondary-button"
          type="button"
          disabled={pagination.page <= 1 || isLoading}
          onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {Math.max(pagination.totalPages || 1, 1)}
        </span>
        <button
          className="secondary-button"
          type="button"
          disabled={pagination.page >= pagination.totalPages || isLoading}
          onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default LeaderboardPage;
