import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { Code2, Container, Bot, BarChart2 } from "lucide-react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <article className="home-container card-fade-in">
      {/* Hero Banner Section */}
      <section className="home-hero">
        <div className="hero-badge">Powered by Google Gemini &amp; Docker isolation</div>
        <h1 className="hero-title">
          The Intelligent <br />
          <span>Online Judge Platform</span>
        </h1>
        <p className="hero-subtitle">
          Practice standard data structures and algorithms, compile solutions instantly inside isolated Docker sandboxes, and receive smart, deep AI reviews of your code.
        </p>

        <div className="hero-cta-buttons">
          <Link className="primary-button hero-btn-main" to="/problems">
            Get Coding &rarr;
          </Link>
          {!isAuthenticated ? (
            <Link className="secondary-button hero-btn-sub" to="/register">
              Create Free Account
            </Link>
          ) : (
            <span className="welcome-back-text">
              Welcome back, <strong>{user?.name}</strong>! Ready to solve?
            </span>
          )}
        </div>
      </section>

      {/* Platform Stats Panel */}
      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-num">&lt; 100ms</span>
          <span className="stat-label">Compile &amp; Execute Speed</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">Isolated Docker Sandbox</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">Gemini 1.5</span>
          <span className="stat-label">AI Code Review Agent</span>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="features-grid-section">
        <h2 className="section-title">Engineered for Modern Developers</h2>
        
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon">
              <Code2 size={26} strokeWidth={1.75} />
            </div>
            <h3>Monaco Code Editor</h3>
            <p>Write your solutions in C++, Java, or Python inside a fully featured Monaco editor, equipped with syntax highlighting and auto-tabbing.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon">
              <Container size={26} strokeWidth={1.75} />
            </div>
            <h3>Docker Sandbox Security</h3>
            <p>Solutions are built and executed inside secure, isolated Linux containers, protecting system resources and ensuring robust performance metrics.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon">
              <Bot size={26} strokeWidth={1.75} />
            </div>
            <h3>Gemini Code Reviewer</h3>
            <p>Stuck on an algorithm or complexity? Request an automated AI review to get instant feedback on bugs, efficiency, and edge cases.</p>
          </div>

          <div className="feat-card">
            <div className="feat-icon">
              <BarChart2 size={26} strokeWidth={1.75} />
            </div>
            <h3>Execution Analytics</h3>
            <p>Track test case passes, exact memory footprints, execution times, compiler outputs, and complete submission histories in real-time.</p>
          </div>
        </div>
      </section>
    </article>
  );
};

export default Home;
