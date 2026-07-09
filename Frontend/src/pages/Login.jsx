import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "store_owner") {
        navigate("/owner/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your ReviewPulse account</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1.5rem;
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .error-alert {
          background: var(--error-glow);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .btn-full {
          width: 100%;
          margin-top: 1rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.9rem;
        }

        .auth-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .auth-link:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
