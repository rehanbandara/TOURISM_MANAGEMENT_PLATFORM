import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../unified-styles.css";

const CHMyBookings = ({ user }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    // Give time for user to load from localStorage
    const checkUser = setTimeout(() => {
      if (!user) {
        showPopup("❌ Please login to view your bookings", "error");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      fetchBookings();
    }, 100); // Small delay to let localStorage load

    return () => clearTimeout(checkUser);
  }, [user, navigate]);

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const userId = user.email || user.username;
      console.log("📥 Fetching bookings for user:", userId);
      const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`);
      console.log("✅ Bookings loaded:", response.data.length);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showPopup("❌ Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (bookingId, orderNumber) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showPopup("✅ Receipt downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showPopup("❌ Failed to download receipt", "error");
    }
  };

  const handleEmailReceipt = async (bookingId) => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/email`);
      showPopup("✅ Receipt sent to your email!", "success");
    } catch (error) {
      console.error("Error sending email:", error);
      showPopup("❌ Failed to send email", "error");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "CH-status-completed";
      case "pending":
        return "CH-status-pending";
      case "processing":
        return "CH-status-processing";
      case "shipped":
        return "CH-status-shipped";
      case "delivered":
        return "CH-status-delivered";
      case "cancelled":
        return "CH-status-cancelled";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="CH-bookings-container">
        <div className="CH-loading-spinner"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="CH-bookings-container">
      {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}

      <div className="CH-bookings-header">
        <h2 className="CH-bookings-title">My Orders</h2>
        <p className="CH-bookings-subtitle">View and manage your purchase history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="CH-empty-state">
          <svg className="CH-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3>No orders yet</h3>
          <p>You haven't made any purchases yet. Start shopping to see your orders here!</p>
          <button className="CH-primary-button" onClick={() => navigate("/itemlist")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="CH-bookings-table-wrapper">
          <table className="CH-bookings-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Product</th>
                <th>Date</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="CH-booking-row">
                  <td className="CH-order-number">{booking.orderNumber}</td>

                  <td className="CH-product-cell">
                    <div className="CH-product-info">
                      {booking.imagePath && (
                        <img
                          src={booking.imagePath}
                          alt={booking.itemName}
                          className="CH-booking-image"
                        />
                      )}
                      <div className="CH-product-details">
                        <span className="CH-product-name">{booking.itemName}</span>
                        <span className="CH-product-price">
                          {booking.currency === "USD" ? "$" : "Rs. "}
                          {booking.itemPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="CH-date-cell">
                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  <td className="CH-quantity-cell">{booking.quantity}</td>

                  <td className="CH-total-cell">
                    <span className="CH-total-amount">
                      {booking.currency === "USD" ? "$" : "Rs. "}
                      {booking.totalAmount.toFixed(2)}
                    </span>
                  </td>

                  <td className="CH-status-cell">
                    <span className={`CH-status-badge ${getStatusBadgeClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>

                  <td className="CH-status-cell">
                    <span className={`CH-status-badge ${getStatusBadgeClass(booking.orderStatus)}`}>
                      {booking.orderStatus}
                    </span>
                  </td>

                  <td className="CH-actions-cell">
                    <div className="CH-action-buttons">
                      <button
                        className="CH-action-btn CH-download-btn"
                        onClick={() => handleDownloadPDF(booking._id, booking.orderNumber)}
                        title="Download Receipt"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>

                      <button
                        className="CH-action-btn CH-email-btn"
                        onClick={() => handleEmailReceipt(booking._id)}
                        title="Email Receipt"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CHMyBookings;

