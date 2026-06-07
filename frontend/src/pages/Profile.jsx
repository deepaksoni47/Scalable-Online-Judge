import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth.js";
import { getUserProfile } from "../services/authService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const Profile = () => {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState(contextUser);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError("");
        const response = await getUserProfile();
        setProfile(response.data);
      } catch (apiError) {
        setError(getErrorMessage(apiError));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="page-status">Loading profile...</div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
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
  );
};

export default Profile;
