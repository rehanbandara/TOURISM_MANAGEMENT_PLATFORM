import React from "react";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";
import "./Dashboard.css";
import CHStudentDashboard from "../CHStudentDashboard/CHStudentDashboard";
import CHStaffDashboard from "../CHStaffDashboard/CHStaffDashboard";
import AdminDashBoard from "../../pages/adminSidePages/AdminDashBoard";

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user state
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('staffSession');
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="CH-dashboard-container">
        <div className="CH-not-logged-in">
          <h2>🔐 Please Log In</h2>
          <p>You must be logged in to view the dashboard.</p>
          <div className="CH-login-buttons">
            <button
              className="CH-primary-button"
              onClick={() => navigate("/login")}
            >
              Student Login
            </button>
            <button
              className="CH-secondary-button"
              onClick={() => navigate("/staff-login")}
            >
              Staff Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  const renderDashboard = () => {
    const userType = user.type || "student"; // Default to student if type is missing

    // Student Dashboard
    if (userType === "student") {
      return <CHStudentDashboard user={user} />;
    }

    // Admin Dashboard - Destinations & Adventures Management
    if (userType === "Administer" || userType === "Admin" || userType === "Administrator") {
      return <AdminDashBoard user={user} onLogout={handleLogout} />;
    }

    // Staff Dashboard for various staff roles
    if (
      userType === "Accessory Handler" ||
      userType === "Hotel Owner" ||
      userType === "Flight Manager" ||
      userType === "Transport Manager" ||
      userType === "Driver" ||
      userType === "Staff"
    ) {
      return <CHStaffDashboard user={user} />;
    }

    // Default dashboard for unknown user types
    return (
      <div className="CH-dashboard-container">
        <div className="CH-unknown-user-type">
          <h2>⚠️ Unknown User Type</h2>
          <p>Your user type "{userType}" is not recognized.</p>
          <p>Please contact support for assistance.</p>
          <button
            className="CH-primary-button"
            onClick={() => navigate("/mainhome")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  };

  return renderDashboard();
};

export default Dashboard;
