import React, { useState, useEffect } from "react";
import api from "../../api";
import Navbar from "../../components/Navbar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Filters & Sorting for Users
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [userSort, setUserSort] = useState({ sortBy: "name", order: "ASC" });

  // Filters & Sorting for Stores
  const [storeFilters, setStoreFilters] = useState({ name: "", email: "", address: "" });
  const [storeSort, setStoreSort] = useState({ sortBy: "name", order: "ASC" });

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [newUserFormErrors, setNewUserFormErrors] = useState({});
  const [newUserServerError, setNewUserServerError] = useState("");

  // New Store Form State
  const [newStoreForm, setNewStoreForm] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [newStoreFormErrors, setNewStoreFormErrors] = useState({});
  const [newStoreServerError, setNewStoreServerError] = useState("");

  // Fetching Data
  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {
        name: userFilters.name,
        email: userFilters.email,
        address: userFilters.address,
        role: userFilters.role,
        sortBy: userSort.sortBy,
        order: userSort.order,
      };
      const res = await api.get("/admin/users", { params });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const params = {
        name: storeFilters.name,
        email: storeFilters.email,
        address: storeFilters.address,
        sortBy: storeSort.sortBy,
        order: storeSort.order,
      };
      const res = await api.get("/admin/stores", { params });
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      // Get all users with store_owner role
      const res = await api.get("/admin/users?role=store_owner");
      // Filter out those who already own a store (we can compare with active stores list)
      const currentStores = await api.get("/admin/stores");
      const ownedIds = currentStores.data
        .map((s) => s.owner_id)
        .filter((id) => id !== null);
      
      const available = res.data.filter((u) => !ownedIds.includes(u.id));
      setAvailableOwners(available);
    } catch (err) {
      console.error("Error fetching owners:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "stores") {
      fetchStores();
    }
  }, [activeTab, userFilters, userSort, storeFilters, storeSort]);

  // Sorting handlers
  const handleUserSort = (field) => {
    const isAsc = userSort.sortBy === field && userSort.order === "ASC";
    setUserSort({ sortBy: field, order: isAsc ? "DESC" : "ASC" });
  };

  const handleStoreSort = (field) => {
    const isAsc = storeSort.sortBy === field && storeSort.order === "ASC";
    setStoreSort({ sortBy: field, order: isAsc ? "DESC" : "ASC" });
  };

  // View user detail modal
  const viewUserDetails = async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUserDetail(res.data);
    } catch (err) {
      console.error("Error getting user detail:", err);
    }
  };

  // Create user
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setNewUserServerError("");
    
    // Validation
    const errors = {};
    if (newUserForm.name.length < 20 || newUserForm.name.length > 60) {
      errors.name = "Name must be 20 to 60 characters long.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email)) {
      errors.email = "Invalid email format.";
    }
    if (newUserForm.address.length > 400 || !newUserForm.address.trim()) {
      errors.address = "Address is required and cannot exceed 400 characters.";
    }
    const password = newUserForm.password;
    if (password.length < 8 || password.length > 16) {
      errors.password = "Password must be 8-16 characters.";
    } else {
      const hasUppercase = /[A-Z]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+\-\[\]\\\/]/.test(password);
      if (!hasUppercase || !hasSpecial) {
        errors.password = "Password needs 1 uppercase and 1 special character.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setNewUserFormErrors(errors);
      return;
    }

    try {
      await api.post("/admin/users", newUserForm);
      setShowAddUserModal(false);
      setNewUserForm({ name: "", email: "", password: "", address: "", role: "user" });
      setNewUserFormErrors({});
      fetchUsers();
      fetchStats();
    } catch (err) {
      setNewUserServerError(err.response?.data?.message || "User creation failed");
    }
  };

  // Create store
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setNewStoreServerError("");

    const errors = {};
    if (newStoreForm.name.length < 20 || newStoreForm.name.length > 60) {
      errors.name = "Store Name must be 20 to 60 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStoreForm.email)) {
      errors.email = "Invalid email format.";
    }
    if (!newStoreForm.address.trim() || newStoreForm.address.length > 400) {
      errors.address = "Address is required and max 400 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setNewStoreFormErrors(errors);
      return;
    }

    try {
      const payload = {
        ...newStoreForm,
        owner_id: newStoreForm.owner_id ? parseInt(newStoreForm.owner_id, 10) : null,
      };
      await api.post("/admin/stores", payload);
      setShowAddStoreModal(false);
      setNewStoreForm({ name: "", email: "", address: "", owner_id: "" });
      setNewStoreFormErrors({});
      fetchStores();
      fetchStats();
    } catch (err) {
      setNewStoreServerError(err.response?.data?.message || "Store creation failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      <Navbar />

      <div className="container">
        {/* Navigation Tabs */}
        <div className="tab-navigation glass-panel">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users Directory
          </button>
          <button
            className={`tab-btn ${activeTab === "stores" ? "active" : ""}`}
            onClick={() => setActiveTab("stores")}
          >
            Stores Directory
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="overview-tab">
            <h2 className="section-title">Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <div className="stat-number">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon">🏬</div>
                <div className="stat-content">
                  <h3>Total Stores</h3>
                  <div className="stat-number">{stats.totalStores}</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>Submitted Ratings</h3>
                  <div className="stat-number">{stats.totalRatings}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="section-header">
              <h2 className="section-title">Users Directory</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setNewUserFormErrors({});
                  setNewUserServerError("");
                  setShowAddUserModal(true);
                }}
              >
                + Add New User
              </button>
            </div>

            {/* Filter Panel */}
            <div className="filter-panel glass-panel">
              <h4 style={{ marginBottom: "1rem" }}>Filters</h4>
              <div className="filters-grid">
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Name"
                    value={userFilters.name}
                    onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Email"
                    value={userFilters.email}
                    onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Address"
                    value={userFilters.address}
                    onChange={(e) => setUserFilters({ ...userFilters, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <select
                    className="input-field"
                    style={{ background: "rgba(10, 10, 15, 0.9)" }}
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleUserSort("name")}>
                      Name {userSort.sortBy === "name" && (userSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleUserSort("email")}>
                      Email {userSort.sortBy === "email" && (userSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleUserSort("address")}>
                      Address {userSort.sortBy === "address" && (userSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleUserSort("role")}>
                      Role {userSort.sortBy === "role" && (userSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {u.address}
                        </td>
                        <td>
                          <span
                            className={`role-tag ${
                              u.role === "admin" ? "tag-admin" : u.role === "store_owner" ? "tag-owner" : "tag-user"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => viewUserDetails(u.id)}>
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stores */}
        {activeTab === "stores" && (
          <div className="stores-tab">
            <div className="section-header">
              <h2 className="section-title">Stores Directory</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  fetchAvailableOwners();
                  setNewStoreFormErrors({});
                  setNewStoreServerError("");
                  setShowAddStoreModal(true);
                }}
              >
                + Add New Store
              </button>
            </div>

            {/* Filter Panel */}
            <div className="filter-panel glass-panel">
              <h4 style={{ marginBottom: "1rem" }}>Filters</h4>
              <div className="filters-grid store-filters-grid">
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Store Name"
                    value={storeFilters.name}
                    onChange={(e) => setStoreFilters({ ...storeFilters, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Email"
                    value={storeFilters.email}
                    onChange={(e) => setStoreFilters({ ...storeFilters, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filter by Address"
                    value={storeFilters.address}
                    onChange={(e) => setStoreFilters({ ...storeFilters, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Stores Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleStoreSort("name")}>
                      Store Name {storeSort.sortBy === "name" && (storeSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleStoreSort("email")}>
                      Email {storeSort.sortBy === "email" && (storeSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleStoreSort("address")}>
                      Address {storeSort.sortBy === "address" && (storeSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleStoreSort("overallRating")}>
                      Overall Rating {storeSort.sortBy === "overallRating" && (storeSort.order === "ASC" ? "▲" : "▼")}
                    </th>
                    <th>Store Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                        No stores found
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.address}
                        </td>
                        <td>
                          <span style={{ color: "var(--warning)", fontWeight: "bold" }}>
                            ★ {s.overallRating ? s.overallRating : "0.0"}
                          </span>
                        </td>
                        <td>{s.owner ? `${s.owner.name} (${s.owner.email})` : "Unassigned"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add User */}
      {showAddUserModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>×</button>
            </div>
            {newUserServerError && <div className="error-alert">{newUserServerError}</div>}
            <form onSubmit={handleAddUserSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name ({newUserForm.name.length}/60)</label>
                <input
                  type="text"
                  className="input-field"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  required
                />
                {newUserFormErrors.name && <span className="error-text">{newUserFormErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                />
                {newUserFormErrors.email && <span className="error-text">{newUserFormErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="8-16 characters, 1 uppercase, 1 special character"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                />
                {newUserFormErrors.password && <span className="error-text">{newUserFormErrors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Address ({newUserForm.address.length}/400)</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: "80px" }}
                  value={newUserForm.address}
                  onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                  required
                />
                {newUserFormErrors.address && <span className="error-text">{newUserFormErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="input-field"
                  style={{ background: "rgba(10, 10, 15, 0.9)" }}
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="user">Normal User</option>
                  <option value="admin">System Administrator</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Store */}
      {showAddStoreModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Add New Store</h3>
              <button className="close-btn" onClick={() => setShowAddStoreModal(false)}>×</button>
            </div>
            {newStoreServerError && <div className="error-alert">{newStoreServerError}</div>}
            <form onSubmit={handleAddStoreSubmit}>
              <div className="form-group">
                <label className="form-label">Store Name ({newStoreForm.name.length}/60)</label>
                <input
                  type="text"
                  className="input-field"
                  value={newStoreForm.name}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })}
                  required
                />
                {newStoreFormErrors.name && <span className="error-text">{newStoreFormErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={newStoreForm.email}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, email: e.target.value })}
                  required
                />
                {newStoreFormErrors.email && <span className="error-text">{newStoreFormErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Address ({newStoreForm.address.length}/400)</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: "80px" }}
                  value={newStoreForm.address}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, address: e.target.value })}
                  required
                />
                {newStoreFormErrors.address && <span className="error-text">{newStoreFormErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Store Owner (Optional)</label>
                <select
                  className="input-field"
                  style={{ background: "rgba(10, 10, 15, 0.9)" }}
                  value={newStoreForm.owner_id}
                  onChange={(e) => setNewStoreForm({ ...newStoreForm, owner_id: e.target.value })}
                >
                  <option value="">-- Select Store Owner --</option>
                  {availableOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <small style={{ color: "var(--text-secondary)", marginTop: "0.25rem", display: "block" }}>
                  Only showing Store Owners who do not currently own a store.
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStoreModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: User Details */}
      {selectedUserDetail && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3>User Profile Details</h3>
              <button className="close-btn" onClick={() => setSelectedUserDetail(null)}>×</button>
            </div>
            
            <div className="user-details-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <span className="details-label">Full Name</span>
                <div className="details-value">{selectedUserDetail.name}</div>
              </div>
              <div>
                <span className="details-label">Email Address</span>
                <div className="details-value">{selectedUserDetail.email}</div>
              </div>
              <div>
                <span className="details-label">Role Badge</span>
                <div>
                  <span
                    className={`role-tag ${
                      selectedUserDetail.role === "admin"
                        ? "tag-admin"
                        : selectedUserDetail.role === "store_owner"
                        ? "tag-owner"
                        : "tag-user"
                    }`}
                  >
                    {selectedUserDetail.role}
                  </span>
                </div>
              </div>
              <div>
                <span className="details-label">Street Address</span>
                <div className="details-value" style={{ whiteSpace: "pre-line" }}>
                  {selectedUserDetail.address}
                </div>
              </div>

              {selectedUserDetail.role === "store_owner" && (
                <div className="store-association-panel" style={{ marginTop: "0.5rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem" }}>
                  <h4 style={{ color: "var(--accent-secondary)", marginBottom: "0.75rem" }}>Owned Store</h4>
                  {selectedUserDetail.store ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div>
                        <span className="details-label">Store Name</span>
                        <div className="details-value">{selectedUserDetail.store.name}</div>
                      </div>
                      <div>
                        <span className="details-label">Store Overall Rating</span>
                        <div className="details-value" style={{ color: "var(--warning)", fontWeight: "bold" }}>
                          ★ {selectedUserDetail.store.overallRating !== undefined ? selectedUserDetail.store.overallRating : "0.0"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontStyle: "italic", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      No store registered for this store owner yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: "2rem" }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUserDetail(null)} style={{ width: "100%" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-navigation {
          display: flex;
          padding: 0.5rem;
          margin-bottom: 2rem;
          gap: 0.5rem;
        }

        .tab-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .tab-btn.active {
          color: #fff;
          background: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .section-title {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 2.25rem;
          gap: 1.5rem;
        }

        .stat-icon {
          font-size: 2.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .stat-content h3 {
          font-size: 0.95rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .stat-number {
          font-size: 2.25rem;
          font-weight: 800;
          font-family: var(--font-display);
          background: linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .filter-panel {
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border-radius: var(--radius-md);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .filters-grid .form-group {
          margin-bottom: 0;
        }

        .role-tag {
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          text-transform: uppercase;
        }

        .tag-admin {
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(99, 102, 241, 0.25);
        }

        .tag-owner {
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent-secondary);
          border: 1px solid rgba(6, 182, 212, 0.25);
        }

        .tag-user {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.25);
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
          max-width: 550px;
          padding: 2.25rem;
          border-radius: var(--radius-lg);
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
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
          margin-top: 1.75rem;
        }

        .error-text {
          display: block;
          color: var(--error);
          font-size: 0.8rem;
          margin-top: 0.25rem;
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

        .details-label {
          display: block;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .details-value {
          font-size: 1rem;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
