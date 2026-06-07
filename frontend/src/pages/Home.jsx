import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero-card">
      <p className="eyebrow">Online Judge</p>
      <h1>Practice, solve, and grow with a focused coding platform.</h1>

      <div className="hero-actions">
        <Link className="secondary-button" to="/problems">
          Browse Problems
        </Link>

        {isAuthenticated ? (
          <Link className="primary-button" to="/profile">
            View Profile
          </Link>
        ) : (
          <>
            <Link className="primary-button" to="/register">
              Create Account
            </Link>
            <Link className="secondary-button" to="/login">
              Login
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
