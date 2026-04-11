import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";
import CHProfile from "../CHProfile/CHProfile";
import CHAccessoryReports from "../CHAccessoryReports/CHAccessoryReports";
import TMvehicle from "../transport/TMvehicle";
import TMvBook from "../transport/TMvBook";
import TMdriver from "../transport/TMdriver";
import BookingChart from "../transport/BookingChart";
import Hotels from "../HotelBooking/HotelOwnerDash/Hotels";
import Rooms from "../HotelBooking/HotelOwnerDash/Rooms";
import Bookings from "../HotelBooking/HotelOwnerDash/Bookings";
import Reviews from "../HotelBooking/HotelOwnerDash/Reviews";
import GuestGalleryAdmin from "../HotelBooking/HotelOwnerDash/GuestGalleryAdmin";

const CHStaffDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="CH-dashboard-overview">
            <h2>Welcome, {user?.username}! 👔</h2>
            <p className="CH-dashboard-subtitle">Staff Management Dashboard</p>

            <div className="CH-dashboard-cards">
              {user?.type === "Accessory Handler" && (
                <>
                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">➕</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Add Accessory</h3>
                      <p>Add new products to the catalog</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => navigate("/imagepart")}
                      >
                        Add New
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📋</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Manage Accessories</h3>
                      <p>View and edit existing products</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => navigate("/acctable")}
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📊</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Sales Reports</h3>
                      <p>View all customer purchases and orders</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("reports")}
                      >
                        View Reports
                      </button>
                    </div>
                  </div>
                </>
              )}

              {user?.type === "Hotel Owner" && (
                <>
                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">🏨</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Manage Hotels</h3>
                      <p>Add and manage hotel properties</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("hotels")}
                      >
                        Manage Hotels
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">🛏️</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Manage Rooms</h3>
                      <p>Update room availability and pricing</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("rooms")}
                      >
                        Manage Rooms
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📅</div>
                    <div className="CH-dashboard-card-content">
                      <h3>View Bookings</h3>
                      <p>Check hotel reservations</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("bookings")}
                      >
                        View Bookings
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">⭐</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Guest Reviews</h3>
                      <p>View and manage reviews</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("reviews")}
                      >
                        View Reviews
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📸</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Photo Gallery</h3>
                      <p>Manage guest photos</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("photos")}
                      >
                        Manage Photos
                      </button>
                    </div>
                  </div>
                </>
              )}

              {user?.type === "Transport Manager" && (
                <>
                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">🚗</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Manage Vehicles</h3>
                      <p>Add and manage transport vehicles</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("vehicles")}
                      >
                        Manage Vehicles
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📖</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Vehicle Bookings</h3>
                      <p>View and manage all bookings</p>
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
                      <h3>Manage Drivers</h3>
                      <p>Add and manage driver information</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("drivers")}
                      >
                        Manage Drivers
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">📊</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Booking Reports</h3>
                      <p>View booking analytics and charts</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => setActiveTab("reports")}
                      >
                        View Reports
                      </button>
                    </div>
                  </div>
                </>
              )}

              {user?.type === "Driver" && (
                <>
                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">🚖</div>
                    <div className="CH-dashboard-card-content">
                      <h3>My Trips</h3>
                      <p>View assigned trips and routes</p>
                      <button className="CH-dashboard-card-btn">
                        View Trips
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">✅</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Update Status</h3>
                      <p>Update trip and availability status</p>
                      <button className="CH-dashboard-card-btn">
                        Update
                      </button>
                    </div>
                  </div>
                </>
              )}

              {user?.type === "Flight Manager" && (
                <>
                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">✈️</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Manage Flights</h3>
                      <p>Create, edit, and manage all flights</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => navigate("/flights/manage")}
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  <div className="CH-dashboard-card">
                    <div className="CH-dashboard-card-icon">👥</div>
                    <div className="CH-dashboard-card-content">
                      <h3>Promo Recipients</h3>
                      <p>View customers who want flight promotions</p>
                      <button
                        className="CH-dashboard-card-btn"
                        onClick={() => navigate("/flights/visits")}
                      >
                        View Recipients
                      </button>
                    </div>
                  </div>
                </>
              )}

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
            </div>

            <div className="CH-dashboard-stats">
              <h3>Today's Statistics</h3>
              <div className="CH-stats-grid">
                <div className="CH-stat-box">
                  <div className="CH-stat-number">24</div>
                  <div className="CH-stat-label">Tasks Completed</div>
                </div>
                <div className="CH-stat-box">
                  <div className="CH-stat-number">12</div>
                  <div className="CH-stat-label">Pending Tasks</div>
                </div>
                <div className="CH-stat-box">
                  <div className="CH-stat-number">98%</div>
                  <div className="CH-stat-label">Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        return <CHProfile user={user} />;
      case "vehicles":
        return user?.type === "Transport Manager" ? <TMvehicle /> : null;
      case "bookings":
        // Handle bookings for both Transport Manager and Hotel Owner
        if (user?.type === "Transport Manager") {
          return <TMvBook />;
        }
        if (user?.type === "Hotel Owner") {
          return <Bookings />;
        }
        return null;
      case "drivers":
        return user?.type === "Transport Manager" ? <TMdriver /> : null;
      case "hotels":
        return user?.type === "Hotel Owner" ? <Hotels /> : null;
      case "rooms":
        return user?.type === "Hotel Owner" ? <Rooms /> : null;
      case "reviews":
        return user?.type === "Hotel Owner" ? <Reviews /> : null;
      case "photos":
        return user?.type === "Hotel Owner" ? <GuestGalleryAdmin /> : null;
      case "reports":
        // If Accessory Handler, show detailed reports
        if (user?.type === "Accessory Handler") {
          return <CHAccessoryReports />;
        }
        // If Transport Manager, show booking chart
        if (user?.type === "Transport Manager") {
          return <BookingChart />;
        }
        return (
          <div className="CH-dashboard-section">
            <h2>Reports & Analytics 📊</h2>
            <p>View detailed reports and statistics (Coming Soon)</p>
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
          <h3>Staff Dashboard</h3>
          <p className="CH-sidebar-role">{user?.type}</p>
        </div>
        <nav className="CH-sidebar-nav">
          <button
            className={`CH-sidebar-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="CH-sidebar-icon">🏠</span>
            Overview
          </button>

          {/* Transport Manager specific menu items */}
          {user?.type === "Transport Manager" && (
            <>
              <button
                className={`CH-sidebar-item ${activeTab === "vehicles" ? "active" : ""}`}
                onClick={() => setActiveTab("vehicles")}
              >
                <span className="CH-sidebar-icon">🚗</span>
                Vehicles
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                <span className="CH-sidebar-icon">📖</span>
                Bookings
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "drivers" ? "active" : ""}`}
                onClick={() => setActiveTab("drivers")}
              >
                <span className="CH-sidebar-icon">👥</span>
                Drivers
              </button>
            </>
          )}

          {/* Hotel Owner specific menu items */}
          {user?.type === "Hotel Owner" && (
            <>
              <button
                className={`CH-sidebar-item ${activeTab === "hotels" ? "active" : ""}`}
                onClick={() => setActiveTab("hotels")}
              >
                <span className="CH-sidebar-icon">🏨</span>
                Hotels
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "rooms" ? "active" : ""}`}
                onClick={() => setActiveTab("rooms")}
              >
                <span className="CH-sidebar-icon">🛏️</span>
                Rooms
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "bookings" ? "active" : ""}`}
                onClick={() => setActiveTab("bookings")}
              >
                <span className="CH-sidebar-icon">📅</span>
                Bookings
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <span className="CH-sidebar-icon">⭐</span>
                Reviews
              </button>
              <button
                className={`CH-sidebar-item ${activeTab === "photos" ? "active" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                <span className="CH-sidebar-icon">📸</span>
                Photos
              </button>
            </>
          )}

          <button
            className={`CH-sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="CH-sidebar-icon">👤</span>
            Profile
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

export default CHStaffDashboard;

