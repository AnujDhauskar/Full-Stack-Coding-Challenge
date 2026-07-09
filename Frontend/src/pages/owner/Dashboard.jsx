import React, { useState, useEffect } from "react";
import api from "../../api";
import Navbar from "../../components/Navbar";

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("DESC"); // newest first

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/owner/dashboard");
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error fetching owner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const renderStarsFull = (rating) => {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rounded ? "#f59e0b" : "#4b5563", fontSize: "1.75rem" }}>
        ★
      </span>
    ));
  };

  const sortedRatings = () => {
    if (!dashboardData?.ratings) return [];
    return [...dashboardData.ratings].sort((a, b) => {
      if (sortOrder === "DESC") return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Navbar />
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      <Navbar />
      <div className="container">

        {!dashboardData?.hasStore ? (
          <div className="no-store-panel glass-panel">
            <div className="no-store-icon">🏬</div>
            <h2>No Store Assigned</h2>
            <p>
              Your account is registered as a Store Owner, but no store has been assigned to you yet.
              <br />Please contact the System Administrator.
            </p>
          </div>
        ) : (
          <>
            {/* Store Info Header */}
            <div className="owner-header glass-panel">
              <div className="owner-header-left">
                <span className="owner-badge">Store Owner</span>
                <h1 className="store-display-name">{dashboardData.store.name}</h1>
                <p className="store-display-address">{dashboardData.store.address}</p>
              </div>
              <div className="rating-spotlight">
                <div className="rating-stars-row">
                  {renderStarsFull(dashboardData.averageRating)}
                </div>
                <div className="avg-rating-number">{dashboardData.averageRating.toFixed(1)}</div>
                <div className="avg-rating-label">Average Rating</div>
                <div className="total-ratings-count">
                  Based on {dashboardData.ratings.length} review{dashboardData.ratings.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="rating-breakdown glass-panel">
              <h3 className="breakdown-title">Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = dashboardData.ratings.filter((r) => r.value === star).length;
                const total = dashboardData.ratings.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={star} className="breakdown-row">
                    <span className="breakdown-star-label">
                      <span style={{ color: "#f59e0b" }}>★</span> {star}
                    </span>
                    <div className="breakdown-bar-bg">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Raters Table */}
            <div className="raters-section">
              <div className="section-header-row">
                <h2 className="section-heading">Customer Reviews</h2>
                <div className="sort-control">
                  <label style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginRight: "0.5rem" }}>
                    Sort by date:
                  </label>
                  <select
                    className="input-field"
                    style={{
                      background: "rgba(10,10,15,0.8)",
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.875rem",
                      width: "auto",
                    }}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                  </select>
                </div>
              </div>

              {dashboardData.ratings.length === 0 ? (
                <div className="empty-state glass-panel" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⭐</div>
                  <h3 style={{ marginBottom: "0.5rem" }}>No Ratings Yet</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    Your store hasn't received any ratings yet. Keep providing great service!
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRatings().map((rating) => (
                        <tr key={rating.id}>
                          <td style={{ fontWeight: 500 }}>{rating.user?.name || "—"}</td>
                          <td style={{ color: "var(--text-secondary)" }}>{rating.user?.email || "—"}</td>
                          <td
                            style={{
                              maxWidth: "220px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--text-secondary)",
                              fontSize: "0.875rem",
                            }}
                          >
                            {rating.user?.address || "—"}
                          </td>
                          <td>
                            <div className="rating-pill">
                              <span style={{ color: "#f59e0b" }}>★</span>
                              <span style={{ fontWeight: 700 }}>{rating.value}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                            {new Date(rating.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          gap: 1rem;
          color: var(--text-secondary);
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .no-store-panel {
          text-align: center;
          padding: 5rem 2rem;
          margin-top: 2rem;
        }
        .no-store-icon { font-size: 3.5rem; margin-bottom: 1rem; }
        .no-store-panel h2 { font-size: 1.75rem; margin-bottom: 0.75rem; }
        .no-store-panel p { color: var(--text-secondary); line-height: 1.8; }

        /* Owner Header */
        .owner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 2.5rem;
          margin-bottom: 1.75rem;
        }
        .owner-badge {
          display: inline-block;
          background: rgba(6,182,212,0.12);
          border: 1px solid rgba(6,182,212,0.3);
          color: var(--accent-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }
        .store-display-name {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.4rem;
        }
        .store-display-address {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .rating-spotlight {
          text-align: center;
          min-width: 200px;
        }
        .rating-stars-row { display: flex; justify-content: center; gap: 2px; margin-bottom: 0.5rem; }
        .avg-rating-number {
          font-size: 3.5rem;
          font-weight: 900;
          font-family: var(--font-display);
          color: #f59e0b;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .avg-rating-label {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .total-ratings-count {
          font-size: 0.825rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        /* Breakdown */
        .rating-breakdown {
          padding: 2rem;
          margin-bottom: 1.75rem;
        }
        .breakdown-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }
        .breakdown-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .breakdown-star-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 36px;
        }
        .breakdown-bar-bg {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .breakdown-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), #f59e0b);
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }
        .breakdown-count {
          font-size: 0.85rem;
          color: var(--text-muted);
          min-width: 24px;
          text-align: right;
        }

        /* Raters */
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .section-heading { font-size: 1.5rem; font-weight: 700; }
        .sort-control { display: flex; align-items: center; }
        .rating-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: var(--radius-sm);
          padding: 0.2rem 0.5rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
