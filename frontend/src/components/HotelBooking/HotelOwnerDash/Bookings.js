import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import './Bookings.css';


const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/bookings");
      setBookings(response.data.bookings);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings.");
      setLoading(false);
    }
  };

  // Update booking status
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/bookings/${id}`, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axios.delete(`http://localhost:5000/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking.");
    }
  };

  // Download booking as PDF
  const handleDownloadPDF = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKING CONFIRMATION", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking ID: ${booking._id.slice(-8).toUpperCase()}`, 20, 40);
    doc.text(`Status: ${booking.status.toUpperCase()}`, 20, 50);
    doc.text(`Payment Status: ${(booking.paymentStatus || "unpaid").toUpperCase()}`, 20, 60);
    
    doc.setFont("helvetica", "bold");
    doc.text("Guest Information:", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${booking.name}`, 20, 90);
    doc.text(`Email: ${booking.email}`, 20, 100);
    doc.text(`Phone: ${booking.phone}`, 20, 110);
    if (booking.userId) {
      doc.text(`User ID: ${booking.userId}`, 20, 120);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("Booking Details:", 20, 140);
    doc.setFont("helvetica", "normal");
    doc.text(`Room Type: ${booking.roomType}`, 20, 150);
    doc.text(`Check-in: ${new Date(booking.checkIn).toLocaleDateString()}`, 20, 160);
    doc.text(`Check-out: ${new Date(booking.checkOut).toLocaleDateString()}`, 20, 170);
    doc.text(`Number of Rooms: ${booking.numberOfRooms}`, 20, 180);
    doc.text(`Adults: ${booking.adults}`, 20, 190);
    doc.text(`Children: ${booking.children}`, 20, 200);
    
    doc.setFont("helvetica", "bold");
    doc.text("Payment Information:", 20, 220);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Price: LKR ${booking.totalPrice?.toLocaleString()}`, 20, 230);
    doc.text(`Payment Method: ${booking.paymentMethod || "N/A"}`, 20, 240);
    if (booking.paymentDetails?.transactionId) {
      doc.text(`Transaction ID: ${booking.paymentDetails.transactionId}`, 20, 250);
    }
    
    if (booking.additionalInfo) {
      doc.setFont("helvetica", "bold");
      doc.text("Additional Information:", 20, 270);
      doc.setFont("helvetica", "normal");
      doc.text(booking.additionalInfo, 20, 280, { maxWidth: 170 });
    }
    
    doc.save(`booking_${booking._id}.pdf`);
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "payment-paid";
      case "refunded":
        return "payment-refunded";
      default:
        return "payment-unpaid";
    }
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  if (loading) return (
    <div className="page">
      
      <h1>Booking Management</h1>
      <div className="loading">Loading bookings...</div>
    </div>
  );
  
  if (error) return (
    <div className="page">
    
      <h1>Booking Management</h1>
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchBookings} className="btn-retry">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      
      <h1>Booking Management</h1>

      <div className="top-actions">
        <button onClick={fetchBookings} className="btn-refresh">
          Refresh Bookings
        </button>
      </div>

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bookings-section">
        <h2>
          {filterStatus === "all" ? "All" : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Bookings ({filteredBookings.length})
        </h2>
        {filteredBookings.length === 0 ? (
          <p className="no-bookings">No bookings found.</p>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-id">
                    Booking #{booking._id.slice(-6).toUpperCase()}
                  </div>
                  <div className="status-badges">
                    <div className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </div>
                    <div className={`status-badge ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus === "paid" ? "✓ PAID" : "⏳ UNPAID"}
                    </div>
                  </div>
                </div>

                <div className="booking-card-body">
                  <div className="guest-info">
                    <h3>{booking.name}</h3>
                    <p className="guest-contact">
                      <span>📧 {booking.email}</span>
                      <span>📞 {booking.phone}</span>
                    </p>
                    {booking.userId && (
                      <p className="user-id-info">
                        <span>👤 User ID: {booking.userId}</span>
                      </p>
                    )}
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-label">Room Type:</span>
                      <span className="detail-value">{booking.roomType}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Check-In:</span>
                      <span className="detail-value">
                        {formatDate(booking.checkIn)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Check-Out:</span>
                      <span className="detail-value">
                        {formatDate(booking.checkOut)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Nights:</span>
                      <span className="detail-value">
                        {calculateNights(booking.checkIn, booking.checkOut)} nights
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Rooms:</span>
                      <span className="detail-value">
                        {booking.numberOfRooms} room(s)
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Guests:</span>
                      <span className="detail-value">
                        {booking.adults} adult(s), {booking.children} child(ren)
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Booked On:</span>
                      <span className="detail-value">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>

                  {booking.additionalInfo && (
                    <div className="additional-info">
                      <strong>Additional Info:</strong>
                      <p>{booking.additionalInfo}</p>
                    </div>
                  )}

                  <div className="booking-price">
                    <span>Total Price:</span>
                    <span className="price-amount">LKR {booking.totalPrice?.toLocaleString()}</span>
                  </div>

                  {/* Payment Information */}
                  <div className="payment-info">
                    <h4>Payment Details</h4>
                    <div className="payment-details">
                      <div className="detail-row">
                        <span className="detail-label">Payment Status:</span>
                        <span className={`detail-value ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus?.toUpperCase() || "UNPAID"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Payment Method:</span>
                        <span className="detail-value">
                          {booking.paymentMethod === "debit_card" ? "Debit Card" : booking.paymentMethod || "N/A"}
                        </span>
                      </div>
                      {booking.paymentDetails?.transactionId && (
                        <div className="detail-row">
                          <span className="detail-label">Transaction ID:</span>
                          <span className="detail-value transaction-id">
                            {booking.paymentDetails.transactionId}
                          </span>
                        </div>
                      )}
                      {booking.paymentDetails?.timestamp && (
                        <div className="detail-row">
                          <span className="detail-label">Payment Date:</span>
                          <span className="detail-value">
                            {formatDate(booking.paymentDetails.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="status-update">
                    <label>Update Status:</label>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        handleStatusChange(booking._id, e.target.value)
                      }
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="booking-card-actions">
                  <button
                    className="btn-download"
                    onClick={() => handleDownloadPDF(booking)}
                  >
                    Download PDF
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(booking._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;