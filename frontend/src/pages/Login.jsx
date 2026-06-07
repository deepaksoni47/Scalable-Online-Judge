import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/profile";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password) {
      return "Email and password are required";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Enter a valid email address";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(getErrorMessage(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-header">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to your account</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>

        <button className="primary-button full-width" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="auth-switch">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
};

export default Login;
