import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";
import CHProfile from "../CHProfile/CHProfile";
import CHMyBookings from "../CHMyBookings/CHMyBookings";
import HMMyHotelBookings from "../HotelBooking/HMMyHotelBookings";

const CHStudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="CH-dashboard-overview">
            <h2>Hello, {user?.username}! 🎓</h2>
            <p className="CH-dashboard-subtitle">
              Here's your User dashboard overview
            </p>

            <div className="CH-dashboard-cards">
              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">📦</div>
                <div className="CH-dashboard-card-content">
                  <h3>My Orders</h3>
                  <p>View and track your accessory orders</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("bookings")}
                  >
                    View Orders
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">🏨</div>
                <div className="CH-dashboard-card-content">
                  <h3>Hotel Bookings</h3>
                  <p>View your hotel reservations</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("hotelbookings")}
                  >
                    View Bookings
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">🛍️</div>
                <div className="CH-dashboard-card-content">
                  <h3>Browse Products</h3>
                  <p>Explore our hiking accessories catalog</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => navigate("/itemlist")}
                  >
                    Browse Now
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">👤</div>
                <div className="CH-dashboard-card-content">
                  <h3>My Profile</h3>
                  <p>Update your personal information</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("profile")}
                  >
                    View Profile
                  </button>
                </div>
              </div>

              <div className="CH-dashboard-card">
                <div className="CH-dashboard-card-icon">📞</div>
                <div className="CH-dashboard-card-content">
                  <h3>Support</h3>
                  <p>Need help? Contact our support team</p>
                  <button
                    className="CH-dashboard-card-btn"
                    onClick={() => setActiveTab("support")}
                  >
                    Get Help
                  </button>
                </div>
              </div>
            </div>

            <div className="CH-dashboard-recent">
              <h3>Recent Activity</h3>
              <div className="CH-dashboard-activity-list">
                <div className="CH-dashboard-activity-item">
                  <span className="CH-activity-icon">🔐</span>
                  <div className="CH-activity-content">
                    <p>Logged in successfully</p>
                    <span className="CH-activity-time">Just now</span>
                  </div>
                </div>
                <div className="CH-dashboard-activity-item">
                  <span className="CH-activity-icon">📦</span>
                  <div className="CH-activity-content">
                    <p>View your order history</p>
                    <span className="CH-activity-time">Click My Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "bookings":
        return <CHMyBookings user={user} />;
      case "hotelbookings":
        return <HMMyHotelBookings user={user} />;
      case "profile":
        return <CHProfile user={user} />;
      case "browse":
        navigate("/itemlist");
        return null;
      case "support":
        return (
          <div className="CH-dashboard-section">
            <h2>Contact Support 📞</h2>
            <p>Need help? We're here for you!</p>
            <div className="CH-support-info">
              <div className="CH-support-card">
                <h3>📧 Email Support</h3>
                <p>support@hikerquest.com</p>
              </div>
              <div className="CH-support-card">
                <h3>📱 Phone Support</h3>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="CH-support-card">
                <h3>💬 Live Chat</h3>
                <p>Available 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="CH-dashboard-layout">
      <aside className="CH-dashboard-sidebar">
        <div className="CH-sidebar-header">
          <h3>User Dashboard</h3>
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
            className={`CH-sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="CH-sidebar-icon">📦</span>
            My Orders
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "hotelbookings" ? "active" : ""}`}
            onClick={() => setActiveTab("hotelbookings")}
          >
            <span className="CH-sidebar-icon">🏨</span>
            Hotel Bookings
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "browse" ? "active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            <span className="CH-sidebar-icon">🛍️</span>
            Browse Products
          </button>
          <button
            className={`CH-sidebar-item ${activeTab === "support" ? "active" : ""}`}
            onClick={() => setActiveTab("support")}
          >
            <span className="CH-sidebar-icon">📞</span>
            Support
          </button>
        </nav>
      </aside>

      <main className="CH-dashboard-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default CHStudentDashboard;

