import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMyStats } from "../services/statsService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const difficultyColors = {
  Easy: "#1d8f5f",
  Medium: "#d58a00",
  Hard: "#c24130",
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getMyStats();

        if (isMounted) {
          setStats(response.data);
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

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const acceptanceChartData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { label: "Accepted", value: stats.acceptedSubmissions },
      {
        label: "Other",
        value: Math.max(stats.totalSubmissions - stats.acceptedSubmissions, 0),
      },
    ];
  }, [stats]);

  if (isLoading) {
    return <p className="page-status">Loading dashboard...</p>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  if (!stats) {
    return <p className="empty-state">No statistics available yet.</p>;
  }

  return (
    <section className="dashboard-page">
      <div className="analytics-header">
        <div>
          <p className="eyebrow">Performance</p>
          <h1>Dashboard</h1>
        </div>
        <span className={`rank-badge ${stats.badge.toLowerCase()}`}>{stats.badge}</span>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total Problems Solved</span>
          <strong>{stats.solvedProblems}</strong>
        </article>
        <article className="metric-card">
          <span>Total Submissions</span>
          <strong>{stats.totalSubmissions}</strong>
        </article>
        <article className="metric-card">
          <span>Accepted Submissions</span>
          <strong>{stats.acceptedSubmissions}</strong>
        </article>
        <article className="metric-card">
          <span>Acceptance Rate</span>
          <strong>{stats.acceptanceRate}%</strong>
        </article>
        <article className="metric-card">
          <span>Current Streak</span>
          <strong>{stats.currentStreak} days</strong>
        </article>
        <article className="metric-card">
          <span>Longest Streak</span>
          <strong>{stats.longestStreak} days</strong>
        </article>
      </div>

      <div className="difficulty-strip">
        <div>
          <span>Easy</span>
          <strong>{stats.easySolved}</strong>
        </div>
        <div>
          <span>Medium</span>
          <strong>{stats.mediumSolved}</strong>
        </div>
        <div>
          <span>Hard</span>
          <strong>{stats.hardSolved}</strong>
        </div>
      </div>

      <div className="charts-grid">
        <article className="chart-panel">
          <h2>Difficulty Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.difficultyDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="difficulty" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="solved" radius={[8, 8, 0, 0]}>
                {stats.difficultyDistribution.map((entry) => (
                  <Cell key={entry.difficulty} fill={difficultyColors[entry.difficulty]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-panel">
          <h2>Submission Trends</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.submissionTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="submissions" stroke="#1d4f3d" strokeWidth={3} />
              <Line type="monotone" dataKey="accepted" stroke="#b35f00" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-panel">
          <h2>Acceptance Rate</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={acceptanceChartData} dataKey="value" nameKey="label" innerRadius={58} outerRadius={92}>
                <Cell fill="#1d8f5f" />
                <Cell fill="#d6dde6" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="chart-center-label">{stats.acceptanceRate}% accepted</p>
        </article>
      </div>

      <article className="activity-panel">
        <h2>Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <p className="empty-state">No submissions yet.</p>
        ) : (
          <div className="activity-list">
            {stats.recentActivity.map((activity) => (
              <div className="activity-row" key={activity.submissionId}>
                <div>
                  <strong>{activity.problemTitle}</strong>
                  <span>{new Date(activity.createdAt).toLocaleString()}</span>
                </div>
                <span className={`verdict-pill ${activity.verdict === "Accepted" ? "accepted" : "failed"}`}>
                  {activity.verdict}
                </span>
                <span>{activity.language}</span>
                <span>{activity.executionTime} ms</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
};

export default DashboardPage;
