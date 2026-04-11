import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../unified-styles.css';
import AdminDestinations from './AdminDestinations';
import AdminAdventures from './AdminAdventures';
import AdminBookings from './AdminBookings';

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="CH-dashboard-overview">
            <h2>Welcome, {user?.username || user?.f_name || 'Admin'}! 👨‍💼</h2>
            <p className="CH-dashboard-subtitle">Tourism Platform Admin Dashboard</p>

            <div className="CH-dashboard-cards">
              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">📍</div>
                <div className="CH-dashboard-card-content">
                  <h3>Manage Destinations</h3>
                  <p>Add and manage tourist destinations</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("destinations")}
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">🏔️</div>
                <div className="CH-dashboard-card-content">
                  <h3>Manage Adventures</h3>
                  <p>Add and manage adventure activities</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("adventures")}
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">📅</div>
                <div className="CH-dashboard-card-content">
                  <h3>View Bookings</h3>
                  <p>Manage all customer bookings</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("bookings")}
                  >
                    View Bookings
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">👥</div>
                <div className="CH-dashboard-card-content">
                  <h3>Manage Staff</h3>
                  <p>Add and manage staff members</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("staff")}
                  >
                    Manage Staff
                  </button>
                </div>
              </div>
            </div>

            <div className="CH-dashboard-stats">
              <h3>Today's Statistics</h3>
              <div className="CH-stats-grid">
                <div className="CH-stat-box">
                  <div className="CH-stat-number">5</div>
                  <div className="CH-stat-label">Destinations</div>
                </div>
                <div className="CH-stat-box">
                  <div className="CH-stat-number">6</div>
                  <div className="CH-stat-label">Adventures</div>
                </div>
                <div className="CH-stat-box">
                  <div className="CH-stat-number">23</div>
                  <div className="CH-stat-label">Total Reviews</div>
                </div>
                <div className="CH-stat-box">
                  <div className="CH-stat-number">4.6</div>
                  <div className="CH-stat-label">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>
        );
      case "destinations":
        return <AdminDestinations />;
      case "adventures":
        return <AdminAdventures />;
      case "bookings":
        return <AdminBookings />;
      case "staff":
        // Navigate to staff management page
        navigate('/add-staff');
        return null;
      default:
        return <div>Select a menu item</div>;
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div className="CH-dashboard-layout">
      <aside className="CH-dashboard-sidebar">
        <div className="CH-sidebar-header">
          <h3>Admin Dashboard</h3>
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
            className={`CH-sidebar-item ${activeTab === "destinations" ? "active" : ""}`}
            onClick={() => setActiveTab("destinations")}
          >
            <span className="CH-sidebar-icon">📍</span>
            Destinations
          </button>

          <button
            className={`CH-sidebar-item ${activeTab === "adventures" ? "active" : ""}`}
            onClick={() => setActiveTab("adventures")}
          >
            <span className="CH-sidebar-icon">🏔️</span>
            Adventures
          </button>

          <button
            className={`CH-sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="CH-sidebar-icon">📅</span>
            Bookings
          </button>

          <button
            className={`CH-sidebar-item ${activeTab === "staff" ? "active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            <span className="CH-sidebar-icon">👥</span>
            Staff
          </button>

          <button
            className="CH-sidebar-item CH-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="CH-sidebar-icon">🚪</span>
            Logout
          </button>
        </nav>
      </aside>

      <main className="CH-dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
