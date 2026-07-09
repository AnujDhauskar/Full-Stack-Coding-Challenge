import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  if (!user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="badge badge-admin">System Admin</span>;
      case "store_owner":
        return <span className="badge badge-owner">Store Owner</span>;
      default:
        return <span className="badge badge-user">User</span>;
    }
  };

  const getDashboardLink = () => {
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "store_owner") return "/owner/dashboard";
    return "/user/dashboard";
  };

  return (
    <nav className="main-navbar glass-panel">
      <div className="nav-container">
        <Link to={getDashboardLink()} className="nav-brand">
          <span className="brand-gradient">ReviewPulse</span>
        </Link>

        <div className="nav-actions">
          <div className="user-profile-info">
            <span className="user-name-display">{user.name}</span>
            {getRoleBadge(user.role)}
          </div>
          
          <Link to="/change-password" className="btn btn-secondary btn-sm">
            Change Password
          </Link>
          
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .main-navbar {
          border-radius: 0;
          border-left: none;
          border-right: none;
          border-top: none;
          padding: 1rem 0;
          margin-bottom: 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          text-decoration: none;
        }

        .brand-gradient {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .user-profile-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-name-display {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-admin {
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .badge-owner {
          background: rgba(6, 182, 212, 0.15);
          color: var(--accent-secondary);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .badge-user {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        @media (max-width: 640px) {
          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }
          .nav-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
