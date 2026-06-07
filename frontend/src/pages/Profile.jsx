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
      default:
        return "verdict-badge";
    }
  };

  if (isLoading) {
    return <div className="page-status">Loading profile...</div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <section className="profile-card">
        <div>
          <p className="eyebrow">Protected profile</p>
          <h1>{profile?.name}</h1>
        </div>

        <div className="profile-grid">
          <div>
            <span>Name</span>
            <strong>{profile?.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{profile?.email}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{profile?.role}</strong>
          </div>
          <div>
            <span>Account created</span>
            <strong>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "Not available"}
            </strong>
          </div>
        </div>
      </section>

      {/* User's general submission history */}
      <section className="profile-card" style={{ maxWidth: "720px" }}>
        <div>
          <p className="eyebrow">Activity history</p>
          <h2>All Submissions ({submissions.length})</h2>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any solutions yet.</p>
            <Link to="/problems" className="primary-button" style={{ marginTop: "1rem", display: "inline-flex" }}>
              Explore Problems
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(23, 32, 51, 0.08)" }}>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#667085", fontSize: "0.85rem", fontWeight: 800 }}>Problem</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#667085", fontSize: "0.85rem", fontWeight: 800 }}>Language</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#667085", fontSize: "0.85rem", fontWeight: 800 }}>Verdict</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#667085", fontSize: "0.85rem", fontWeight: 800 }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submissionId} style={{ borderBottom: "1px solid rgba(23, 32, 51, 0.05)" }}>
                    <td style={{ padding: "1rem 0.5rem" }}>
                      <Link 
                        to={`/problems/${sub.problemId?._id || sub.problemId}`}
                        style={{ color: "#b35f00", fontWeight: 800, textDecoration: "none" }}
                      >
                        {sub.problemId?.title || "Unknown Problem"}
                      </Link>
                    </td>
                    <td style={{ padding: "1rem 0.5rem", fontWeight: 700 }}>
                      {sub.language.toUpperCase()}
                    </td>
                    <td style={{ padding: "1rem 0.5rem" }}>
                      <span className={getVerdictClass(sub.verdict)} style={{ padding: "0.25rem 0.75rem", fontSize: "0.78rem" }}>
                        {sub.verdict}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 0.5rem", color: "#667085", fontSize: "0.85rem" }}>
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
