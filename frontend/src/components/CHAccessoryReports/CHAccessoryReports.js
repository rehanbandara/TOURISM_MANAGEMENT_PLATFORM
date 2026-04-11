import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../unified-styles.css";

const CHAccessoryReports = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/bookings/all");
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showPopup("Failed to fetch bookings", "error");
      setLoading(false);
    }
  };

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        orderStatus: newStatus,
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, orderStatus: newStatus }
          : booking
      ));
      
      showPopup(`Order status updated to ${newStatus}!`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      showPopup("Failed to update order status", "error");
    }
  };


  const handleGenerateFullReport = async () => {
    try {
      showPopup("Generating comprehensive report...", "success");
      
      // Filter bookings based on current filters
      const filteredData = getFilteredBookings();
      
      // Create CSV content
      const csvContent = [
        ["Order Number", "Customer Name", "Email", "Phone", "Address", "Item Name", "Quantity", "Total Amount", "Currency", "Payment Status", "Order Status", "Date"].join(","),
        ...filteredData.map(booking => {
          const address = `${booking.address.street} ${booking.address.city} ${booking.address.state} ${booking.address.zipCode} ${booking.address.country}`.trim();
          return [
            booking.orderNumber,
            booking.fullName,
            booking.userEmail,
            booking.phoneNumber,
            `"${address}"`, // Wrap address in quotes to handle commas
            booking.itemName,
            booking.quantity,
            booking.totalAmount,
            booking.currency,
            booking.paymentStatus,
            booking.orderStatus,
            new Date(booking.createdAt).toLocaleDateString()
          ].join(",");
        })
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `accessory-sales-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showPopup("Report downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating report:", error);
      showPopup("Failed to generate report", "error");
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.itemName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === "all" || booking.paymentStatus === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "CH-status-badge CH-status-completed";
      case "pending":
        return "CH-status-badge CH-status-pending";
      case "failed":
        return "CH-status-badge CH-status-failed";
      default:
        return "CH-status-badge";
    }
  };

  const filteredBookings = getFilteredBookings();

  // Calculate statistics
  const totalSales = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const completedOrders = filteredBookings.filter(b => b.paymentStatus === "completed").length;
  const pendingOrders = filteredBookings.filter(b => b.paymentStatus === "pending").length;

  if (loading) {
    return (
      <div className="CH-reports-loading">
        <div className="CH-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="CH-reports-container">
      {message && (
        <div className={`CH-popup-message ${messageType}`}>{message}</div>
      )}

      <div className="CH-reports-header">
        <div>
          <h2>📊 Accessory Sales Reports</h2>
          <p className="CH-reports-subtitle">
            View all customer purchases and payment details
          </p>
        </div>
        <button 
          className="CH-generate-report-btn"
          onClick={handleGenerateFullReport}
        >
          📄 Generate Full Report (CSV)
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="CH-reports-stats">
        <div className="CH-stat-card">
          <div className="CH-stat-icon">💰</div>
          <div className="CH-stat-details">
            <h4>Total Sales</h4>
            <p className="CH-stat-value">${totalSales.toFixed(2)}</p>
          </div>
        </div>
        <div className="CH-stat-card">
          <div className="CH-stat-icon">✅</div>
          <div className="CH-stat-details">
            <h4>Completed Orders</h4>
            <p className="CH-stat-value">{completedOrders}</p>
          </div>
        </div>
        <div className="CH-stat-card">
          <div className="CH-stat-icon">⏳</div>
          <div className="CH-stat-details">
            <h4>Pending Orders</h4>
            <p className="CH-stat-value">{pendingOrders}</p>
          </div>
        </div>
        <div className="CH-stat-card">
          <div className="CH-stat-icon">📦</div>
          <div className="CH-stat-details">
            <h4>Total Orders</h4>
            <p className="CH-stat-value">{filteredBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="CH-reports-filters">
        <div className="CH-filter-group">
          <label>🔍 Search:</label>
          <input
            type="text"
            placeholder="Search by name, email, order #, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="CH-filter-input"
          />
        </div>
        <div className="CH-filter-group">
          <label>💳 Payment Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="CH-filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="CH-reports-table-container">
        {filteredBookings.length === 0 ? (
          <div className="CH-no-reports">
            <div className="CH-no-reports-icon">📭</div>
            <h3>No Orders Found</h3>
            <p>There are no orders matching your filters.</p>
          </div>
        ) : (
          <table className="CH-reports-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const address = booking.address 
                  ? `${booking.address.street || ''}, ${booking.address.city || ''}, ${booking.address.state || ''}, ${booking.address.zipCode || ''}, ${booking.address.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')
                  : 'N/A';
                
                return (
                  <tr key={booking._id}>
                    <td className="CH-order-number">{booking.orderNumber}</td>
                    <td>{booking.fullName}</td>
                    <td>{booking.userEmail}</td>
                    <td>{booking.phoneNumber}</td>
                    <td className="CH-address-cell" title={address}>
                      {address}
                    </td>
                    <td className="CH-item-name">{booking.itemName}</td>
                    <td>{booking.quantity}</td>
                    <td className="CH-amount">
                      {booking.currency === "USD" ? "$" : "Rs. "}
                      {booking.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(booking.paymentStatus)}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`CH-status-select ${
                          booking.orderStatus === "completed" 
                            ? "CH-status-select-completed" 
                            : booking.orderStatus === "processing"
                            ? "CH-status-select-processing"
                            : "CH-status-select-pending"
                        }`}
                        value={booking.orderStatus}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="processing">🔄 Processing</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CHAccessoryReports;

