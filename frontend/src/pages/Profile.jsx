import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth.js";
import { getUserProfile } from "../services/authService.js";
import { getMySubmissions } from "../services/submissionService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState(contextUser);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndSubmissions = async () => {
      try {
        setError("");
        const [profileRes, submissionsRes] = await Promise.all([
          getUserProfile(),
          getMySubmissions()
        ]);
        setProfile(profileRes.data);
        setSubmissions(submissionsRes.data);
      } catch (apiError) {
        setError(getErrorMessage(apiError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndSubmissions();
  }, []);

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
      case "Time Limit Exceeded":
        return "verdict-badge verdict-tle";
      case "Memory Limit Exceeded":
        return "verdict-badge verdict-mle";
      default:
        return "verdict-badge";
    }
  };

  if (isLoading) {
    return (
      <div className="page-status" style={{ padding: "4rem 0" }}>
        <div className="spinner" style={{ margin: "0 auto 1.5rem" }}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div className="problems-page-container card-fade-in" style={{ display: "grid", gap: "2.5rem" }}>
      {/* Profile Info Section */}
      <section className="problems-hero" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)" }}>
        <div className="hero-content">
          <p className="eyebrow" style={{ color: "#ffd480" }}>Developer Dashboard</p>
          <h1 style={{ margin: "0.5rem 0" }}>{profile?.name}</h1>
          <p className="hero-subtext" style={{ color: "#94a3b8" }}>
            Manage your credentials, view submission performance, and track your competitive programming journey.
          </p>
        </div>
      </section>

      {/* User Details Details Grid */}
      <section className="filters-container" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", color: "#1e293b", fontWeight: 800, margin: "0 0 1.5rem 0" }}>Account Details</h2>
        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Full Name</span>
            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{profile?.name}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Email Address</span>
            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{profile?.email}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>System Role</span>
            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{profile?.role}</strong>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Joined Since</span>
            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                : "Not available"}
            </strong>
          </div>
        </div>
      </section>

      {/* User's general submission history */}
      <section className="submissions-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", color: "#1e293b", fontWeight: 800, margin: 0 }}>Submission History</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>Review your past code performance metrics</p>
          </div>
          <span style={{ background: "#f1f5f9", padding: "0.4rem 1rem", borderRadius: "99px", fontSize: "0.85rem", fontWeight: 800, color: "#475569" }}>
            {submissions.length} Total
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-state" style={{ padding: "4rem 2rem", border: "1px solid #e2e8f0", borderRadius: "24px", background: "#ffffff" }}>
            <span style={{ fontSize: "2.5rem" }}>📝</span>
            <p style={{ margin: "1rem 0 0 0", color: "#64748b" }}>You haven't submitted any solutions yet.</p>
            <Link to="/problems" className="primary-button" style={{ marginTop: "1rem", display: "inline-flex" }}>
              Explore Problems
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="problems-table">
              <thead>
                <tr>
                  <th>Problem Name</th>
                  <th>Language</th>
                  <th>Verdict Result</th>
                  <th>Submitted Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submissionId}>
                    <td>
                      <Link 
                        to={`/problems/${sub.problemId?._id || sub.problemId}`}
                        className="problem-link-title"
                      >
                        {sub.problemId?.title || "Unknown Problem"}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 700, color: "#475569" }}>
                      {sub.language.toUpperCase()}
                    </td>
                    <td>
                      <span className={getVerdictClass(sub.verdict)}>
                        {sub.verdict}
                      </span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "0.9rem" }}>
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
