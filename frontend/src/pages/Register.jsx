import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      return "Name, email, password and confirm password are required";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      return "Enter a valid email address";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (apiError) {
      setError(getErrorMessage(apiError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <div className="auth-header">
        <p className="eyebrow">Create account</p>
        <h1>Register for Online Judge</h1>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
        </label>

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
        </label>

        <button className="primary-button full-width" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="auth-switch">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  );
};

export default Register;
