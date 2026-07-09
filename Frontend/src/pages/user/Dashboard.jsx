import React, { useState, useEffect } from "react";
import api from "../../api";
import Navbar from "../../components/Navbar";

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalMode, setModalMode] = useState("submit"); // "submit" or "modify"
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/stores", {
        params: { search },
      });
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStores();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const openRatingModal = (store, currentRating = 0) => {
    setSelectedStore(store);
    setRatingValue(currentRating);
    setHoverRating(0);
    setModalMode(currentRating > 0 ? "modify" : "submit");
    setModalError("");
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (ratingValue < 1 || ratingValue > 5) {
      setModalError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      if (modalMode === "submit") {
        await api.post("/user/ratings", {
          storeId: selectedStore.id,
          value: ratingValue,
        });
      } else {
        await api.put(`/user/ratings/${selectedStore.id}`, {
          value: ratingValue,
        });
      }
      setSelectedStore(null);
      fetchStores();
    } catch (err) {
      setModalError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i} className="star-display active">★</span>);
      } else {
        stars.push(<span key={i} className="star-display">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <Navbar />

      <div className="container">
        <div className="dashboard-header-panel">
          <h2 className="dashboard-title">Explore Registered Stores</h2>
          <p className="dashboard-subtitle">Browse, search, and submit your ratings for registered stores.</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-container glass-panel">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-field"
              placeholder="Search stores by Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="empty-state glass-panel">
            <div className="empty-icon">🏬</div>
            <h3>No Stores Found</h3>
            <p>We couldn't find any stores matching your search query.</p>
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card glass-card">
                <div className="store-header">
                  <h3 className="store-name">{store.name}</h3>
                  <div className="overall-rating-badge">
                    <span className="rating-star">★</span>
                    <span className="rating-value">
                      {store.overallRating > 0 ? store.overallRating : "0.0"}
                    </span>
                  </div>
                </div>

                <p className="store-address">{store.address}</p>

                <div className="store-footer">
                  <div className="user-rating-section">
                    <span className="user-rating-label">Your Rating</span>
                    <div className="user-stars">
                      {store.userRating ? (
                        <>
                          {renderStars(store.userRating)}
                          <span className="user-rating-numeric">({store.userRating})</span>
                        </>
                      ) : (
                        <span className="not-rated-text">Not rated yet</span>
                      )}
                    </div>
                  </div>

                  <button
                    className={`btn btn-sm ${store.userRating ? "btn-secondary" : "btn-primary"}`}
                    onClick={() => openRatingModal(store, store.userRating || 0)}
                  >
                    {store.userRating ? "Modify Rating" : "Submit Rating"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Submit/Modify Modal */}
      {selectedStore && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: "440px" }}>
            <div className="modal-header">
              <h3>{modalMode === "submit" ? "Submit Rating" : "Modify Rating"}</h3>
              <button className="close-btn" onClick={() => setSelectedStore(null)}>×</button>
            </div>

            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              How would you rate your experience at <strong>{selectedStore.name}</strong>?
            </p>

            {modalError && <div className="error-alert">{modalError}</div>}

            <form onSubmit={handleRatingSubmit}>
              <div className="star-picker-container">
                {[1, 2, 3, 4, 5].map((index) => (
                  <span
                    key={index}
                    className={`star-picker-item ${
                      index <= (hoverRating || ratingValue) ? "active" : ""
                    }`}
                    onMouseEnter={() => setHoverRating(index)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRatingValue(index)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className="rating-description">
                {ratingValue === 1 && "Poor 😞"}
                {ratingValue === 2 && "Fair 😐"}
                {ratingValue === 3 && "Good 🙂"}
                {ratingValue === 4 && "Very Good 😀"}
                {ratingValue === 5 && "Excellent! 😍"}
              </div>

              <div className="modal-actions" style={{ marginTop: "2rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedStore(null)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading || ratingValue === 0}
                >
                  {modalLoading ? "Saving..." : modalMode === "submit" ? "Submit" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-header-panel {
          margin-bottom: 2rem;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .search-bar-container {
          padding: 1rem;
          margin-bottom: 2rem;
          border-radius: var(--radius-md);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(10, 10, 15, 0.5);
          border: 1px solid var(--glass-border);
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-sm);
        }

        .search-icon {
          font-size: 1.2rem;
          margin-right: 0.75rem;
          color: var(--text-muted);
        }

        .search-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 1rem;
        }

        .search-field::placeholder {
          color: var(--text-muted);
        }

        .loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 0;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--text-secondary);
        }

        .stores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
        }

        .store-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
        }

        .store-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .store-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .overall-rating-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.25rem 0.5rem;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--warning);
          gap: 0.25rem;
        }

        .store-address {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .store-footer {
          border-top: 1px solid var(--glass-border);
          padding-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-rating-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .user-rating-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .user-stars {
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }

        .star-display {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .star-display.active {
          color: var(--warning);
        }

        .user-rating-numeric {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-left: 0.25rem;
        }

        .not-rated-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Star Picker Styles */
        .star-picker-container {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin: 1.5rem 0 0.5rem;
        }

        .star-picker-item {
          font-size: 2.75rem;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.15s ease, transform 0.15s ease;
        }

        .star-picker-item:hover {
          transform: scale(1.15);
        }

        .star-picker-item.active {
          color: var(--warning);
          text-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
        }

        .rating-description {
          text-align: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-primary);
          height: 1.5rem;
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 200;
          padding: 1.5rem;
        }

        .modal-content {
          width: 100%;
          padding: 2.25rem;
          border-radius: var(--radius-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.75rem;
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .error-alert {
          background: var(--error-glow);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
