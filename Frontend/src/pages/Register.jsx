import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field-specific error as they type
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name check: 20-60 characters
    if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = `Name must be between 20 and 60 characters long (current length: ${formData.name.length}).`;
    }

    // Email check: standard pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Address check: max 400 characters
    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (formData.address.length > 400) {
      newErrors.address = `Address cannot exceed 400 characters (current length: ${formData.address.length}).`;
    }

    // Password check: 8-16 characters, 1 uppercase, 1 special character
    const password = formData.password;
    if (password.length < 8 || password.length > 16) {
      newErrors.password = "Password must be 8-16 characters long.";
    } else {
      const hasUppercase = /[A-Z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+\-\[\]\\\/]/.test(password);
      if (!hasUppercase && !hasSpecial) {
        newErrors.password = "Password must contain at least one uppercase letter and one special character.";
      } else if (!hasUppercase) {
        newErrors.password = "Password must contain at least one uppercase letter.";
      } else if (!hasSpecial) {
        newErrors.password = "Password must contain at least one special character.";
      }
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.address
      );
      navigate("/user/dashboard");
    } catch (err) {
      setServerError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register to rate your favorite stores</p>
        </div>

        {serverError && <div className="error-alert">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name ({formData.name.length}/60)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input-field ${errors.name ? "input-error" : ""}`}
              placeholder="Min 20, max 60 characters"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`input-field ${errors.email ? "input-error" : ""}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">
              Address ({formData.address.length}/400)
            </label>
            <textarea
              id="address"
              name="address"
              className={`input-field ${errors.address ? "input-error" : ""}`}
              style={{ minHeight: "80px", resize: "vertical" }}
              placeholder="Enter your street address..."
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={`input-field ${errors.password ? "input-error" : ""}`}
              placeholder="8-16 chars, 1 uppercase, 1 special symbol"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
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
          padding: 2rem 1.5rem;
        }

        .auth-card {
          width: 100%;
          max-width: 500px;
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

        .input-error {
          border-color: rgba(239, 68, 68, 0.5);
        }

        .field-error {
          display: block;
          color: var(--error);
          font-size: 0.8rem;
          margin-top: 0.35rem;
          line-height: 1.4;
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

export default Register;
