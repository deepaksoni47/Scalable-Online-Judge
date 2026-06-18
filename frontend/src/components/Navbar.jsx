import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        Online Judge
      </Link>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/problems">Problems</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>

        {isAuthenticated ? (
          <>
            <span className="nav-user">Hi, {user?.name}</span>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/ai-reviews">AI Reviews</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button className="link-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
