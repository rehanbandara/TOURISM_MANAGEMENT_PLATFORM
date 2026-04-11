import React, { useState, useEffect } from "react";
import "../../unified-styles.css";
import "./HMMyHotelBookings.css";

const HMMyHotelBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/bookings?userId=${user._id}`);
      const data = await response.json();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "HM-status-confirmed";
      case "pending":
        return "HM-status-pending";
      case "cancelled":
        return "HM-status-cancelled";
      default:
        return "HM-status-pending";
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "HM-payment-paid";
      case "unpaid":
        return "HM-payment-unpaid";
      case "refunded":
        return "HM-payment-refunded";
      default:
        return "HM-payment-unpaid";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="CH-loading-container">
        <div className="CH-loading-spinner"></div>
        <p className="CH-loading-text">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="CH-error-container">
        <p>❌ {error}</p>
        <button className="CH-btn-primary" onClick={fetchBookings}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="HM-bookings-container">
      <div className="HM-bookings-header">
        <h2 className="CH-layout-content">🏨 My Hotel Bookings</h2>
        <p className="HM-bookings-subtitle">
          View and manage your hotel reservations
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="CH-empty-state">
          <span className="CH-empty-icon">📭</span>
          <h3>No Hotel Bookings Yet</h3>
          <p>Start exploring our hotels and make your first reservation!</p>
          <button
            className="CH-btn-primary"
            onClick={() => window.location.href = "/hotels"}
          >
            Browse Hotels
          </button>
        </div>
      ) : (
        <div className="HM-bookings-grid">
          {bookings.map((booking) => (
            <div key={booking._id} className="HM-booking-card">
              <div className="HM-booking-card-header">
                <div className="HM-booking-id">
                  <span className="HM-label">Booking ID:</span>
                  <span className="HM-value">#{booking._id.slice(-8)}</span>
                </div>
                <div className="HM-booking-badges">
                  <span className={`HM-status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status || "Pending"}
                  </span>
                  <span className={`HM-payment-badge ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                    {booking.paymentStatus === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                  </span>
                </div>
              </div>

              <div className="HM-booking-card-body">
                {/* Hotel Information */}
                <div className="HM-info-section">
                  <h4 className="HM-section-title">🏨 Hotel Details</h4>
                  {booking.hotelId ? (
                    <>
                      <div className="HM-info-row">
                        <span className="HM-label">Hotel Name:</span>
                        <span className="HM-value">{booking.hotelId.name || "N/A"}</span>
                      </div>
                      <div className="HM-info-row">
                        <span className="HM-label">Location:</span>
                        <span className="HM-value">
                          {booking.hotelId.city || "N/A"}, {booking.hotelId.province || "Sri Lanka"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="HM-value">Hotel information unavailable</p>
                  )}
                </div>

                {/* Room Information */}
                <div className="HM-info-section">
                  <h4 className="HM-section-title">🛏️ Room Details</h4>
                  <div className="HM-info-row">
                    <span className="HM-label">Room Type:</span>
                    <span className="HM-value">{booking.roomType}</span>
                  </div>
                  <div className="HM-info-row">
                    <span className="HM-label">Number of Rooms:</span>
                    <span className="HM-value">{booking.numberOfRooms}</span>
                  </div>
                  <div className="HM-info-row">
                    <span className="HM-label">Guests:</span>
                    <span className="HM-value">
                      {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                      {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
                    </span>
                  </div>
                </div>

                {/* Date Information */}
                <div className="HM-info-section">
                  <h4 className="HM-section-title">📅 Stay Duration</h4>
                  <div className="HM-info-row">
                    <span className="HM-label">Check-In:</span>
                    <span className="HM-value HM-date">{formatDate(booking.checkIn)}</span>
                  </div>
                  <div className="HM-info-row">
                    <span className="HM-label">Check-Out:</span>
                    <span className="HM-value HM-date">{formatDate(booking.checkOut)}</span>
                  </div>
                  {booking.priceBreakdown?.numberOfNights && (
                    <div className="HM-info-row">
                      <span className="HM-label">Total Nights:</span>
                      <span className="HM-value">{booking.priceBreakdown.numberOfNights}</span>
                    </div>
                  )}
                </div>

                {/* Guest Information */}
                <div className="HM-info-section">
                  <h4 className="HM-section-title">👤 Guest Information</h4>
                  <div className="HM-info-row">
                    <span className="HM-label">Name:</span>
                    <span className="HM-value">{booking.name}</span>
                  </div>
                  <div className="HM-info-row">
                    <span className="HM-label">Email:</span>
                    <span className="HM-value">{booking.email}</span>
                  </div>
                  <div className="HM-info-row">
                    <span className="HM-label">Phone:</span>
                    <span className="HM-value">{booking.phone}</span>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="HM-info-section HM-payment-section">
                  <h4 className="HM-section-title">💳 Payment Details</h4>
                  <div className="HM-info-row">
                    <span className="HM-label">Total Amount:</span>
                    <span className="HM-value HM-price">
                      LKR {booking.totalPrice?.toLocaleString()}
                    </span>
                  </div>
                  {booking.paymentDetails?.transactionId && (
                    <div className="HM-info-row">
                      <span className="HM-label">Transaction ID:</span>
                      <span className="HM-value HM-transaction">
                        {booking.paymentDetails.transactionId}
                      </span>
                    </div>
                  )}
                  <div className="HM-info-row">
                    <span className="HM-label">Payment Status:</span>
                    <span className={`HM-value ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                      {booking.paymentStatus?.toUpperCase() || "UNPAID"}
                    </span>
                  </div>
                </div>

                {/* Additional Information */}
                {booking.additionalInfo && (
                  <div className="HM-info-section">
                    <h4 className="HM-section-title">📝 Additional Notes</h4>
                    <p className="HM-additional-info">{booking.additionalInfo}</p>
                  </div>
                )}
              </div>

              <div className="HM-booking-card-footer">
                <div className="HM-booking-date">
                  <span className="HM-label">Booked on:</span>
                  <span className="HM-value">{formatDate(booking.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HMMyHotelBookings;

