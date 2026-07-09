import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { changeUserPassword, user } = useAuth();
  const navigate = useNavigate();

  const validatePasswords = () => {
    // Password validation rules: 8-16 chars, 1 uppercase, 1 special
    if (newPassword.length < 8 || newPassword.length > 16) {
      setError("New password must be 8-16 characters long.");
      return false;
    }

    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+\-\[\]\\\/]/.test(newPassword);
    if (!hasUppercase || !hasSpecial) {
      setError("New password must contain at least one uppercase letter and one special character.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await changeUserPassword(oldPassword, newPassword);
      setSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getBackPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "store_owner") return "/owner/dashboard";
    return "/user/dashboard";
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="container" style={{ maxWidth: "480px", paddingTop: "2rem" }}>
        <div className="glass-panel" style={{ padding: "2.5rem" }}>
          <h2 style={{ marginBottom: "0.5rem", fontSize: "1.75rem" }}>Update Password</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Ensure your account is using a secure, robust password.
          </p>

          {error && <div className="error-alert">{error}</div>}
          {success && <div className="success-alert">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="oldPassword">
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                className="input-field"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="input-field"
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(getBackPath())}
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .error-alert {
          background: var(--error-glow);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .success-alert {
          background: var(--success-glow);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--success);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;
