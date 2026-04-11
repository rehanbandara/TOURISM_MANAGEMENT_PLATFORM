import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../unified-styles.css";
import CHProfile from "../CHProfile/CHProfile";

const CHAdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users/all");
      console.log("✅ Users loaded:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showPopup("❌ Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const getFilteredUsers = () => {
    if (!searchTerm) return users;
    
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="CH-dashboard-overview">
            <h2>Admin Dashboard 👨‍💼</h2>
            <p className="CH-dashboard-subtitle">
              System Overview & Management
            </p>

            <div className="CH-dashboard-stats-admin">
              <div className="CH-admin-stat-card">
                <div className="CH-admin-stat-icon">👥</div>
                <div className="CH-admin-stat-content">
                  <h3>Total Users</h3>
                  <p className="CH-admin-stat-number">1,234</p>
                  <span className="CH-admin-stat-change positive">+12% this month</span>
                </div>
              </div>

              <div className="CH-admin-stat-card">
                <div className="CH-admin-stat-icon">📦</div>
                <div className="CH-admin-stat-content">
                  <h3>Total Orders</h3>
                  <p className="CH-admin-stat-number">856</p>
                  <span className="CH-admin-stat-change positive">+8% this month</span>
                </div>
              </div>

              <div className="CH-admin-stat-card">
                <div className="CH-admin-stat-icon">💰</div>
                <div className="CH-admin-stat-content">
                  <h3>Revenue</h3>
                  <p className="CH-admin-stat-number">$45,678</p>
                  <span className="CH-admin-stat-change positive">+15% this month</span>
                </div>
              </div>

              <div className="CH-admin-stat-card">
                <div className="CH-admin-stat-icon">📊</div>
                <div className="CH-admin-stat-content">
                  <h3>Conversion Rate</h3>
                  <p className="CH-admin-stat-number">3.2%</p>
                  <span className="CH-admin-stat-change negative">-2% this month</span>
                </div>
              </div>
            </div>

            <div className="CH-dashboard-cards">
              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">👥</div>
                <div className="CH-dashboard-card-content">
                  <h3>Manage Users</h3>
                  <p>View and manage all system users</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("users")}
                  >
                    Manage Users
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">👔</div>
                <div className="CH-dashboard-card-content">
                  <h3>Manage Staff</h3>
                  <p>Add and manage staff members</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => navigate("/add-staff")}
                  >
                    Manage Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return <CHProfile user={user} />;
      case "users":
        const filteredUsers = getFilteredUsers();
        
        if (loading) {
          return (
            <div className="CH-dashboard-section">
              <div className="CH-loading-container">
                <div className="CH-loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            </div>
          );
        }

        return (
          <div className="CH-dashboard-section">
            <div className="CH-users-header">
              <div>
                <h2>User Management 👥</h2>
                <p className="CH-users-subtitle">View and manage all registered users</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="CH-users-search">
              <input
                type="text"
                placeholder="🔍 Search by username, name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="CH-search-input"
              />
            </div>

            {/* Users Table */}
            <div className="CH-users-table-container">
              {filteredUsers.length === 0 ? (
                <div className="CH-no-users">
                  <div className="CH-no-users-icon">👥</div>
                  <h3>No Users Found</h3>
                  <p>
                    {searchTerm 
                      ? "No users match your search criteria." 
                      : "No users registered in the system yet."}
                  </p>
                </div>
              ) : (
                <table className="CH-users-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Type</th>
                      <th>Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user._id} className="CH-user-row">
                        <td>{index + 1}</td>
                        <td className="CH-user-username">
                          <div className="CH-user-avatar-cell">
                            <div className="CH-user-avatar-small">
                              {(user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            {user.username}
                          </div>
                        </td>
                        <td>{user.fullName || 'N/A'}</td>
                        <td className="CH-user-email">{user.email || 'N/A'}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>
                          <span className="CH-user-type-badge">
                            {user.type || 'Student'}
                          </span>
                        </td>
                        <td className="CH-user-date">
                          {user.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Users Count */}
            <div className="CH-users-footer">
              <p>
                Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
              </p>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="CH-dashboard-section">
            <h2>Reports & Analytics 📊</h2>
            <p>Comprehensive system reports (Coming Soon)</p>
            <div className="CH-placeholder-content">
              <div className="CH-placeholder-icon">📊</div>
              <p>Detailed analytics and reports will be displayed here</p>
            </div>
          </div>
        );
      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="CH-dashboard-layout">
      {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}
      
      <aside className="CH-dashboard-sidebar">
        <div className="CH-sidebar-header">
          <h3>Admin Panel</h3>
          <p className="CH-sidebar-role">Administrator</p>
        </div>
        <nav className="CH-sidebar-nav">
          <button
            className={`CH-sidebar-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="CH-sidebar-icon">🏠</span>
            Overview
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="CH-sidebar-icon">👤</span>
            Profile
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <span className="CH-sidebar-icon">👥</span>
            Users
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span className="CH-sidebar-icon">📊</span>
            Reports
          </button>
        </nav>
      </aside>

      <main className="CH-dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default CHAdminDashboard;

