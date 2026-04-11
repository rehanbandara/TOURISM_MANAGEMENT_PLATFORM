import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter, paymentFilter, typeFilter, dateFilter, sortBy, sortOrder]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/trip-bookings');
      const bookingsData = response.data.data || response.data;
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.bookingStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.bookingType === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          cutoffDate.setDate(now.getDate());
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(booking => new Date(booking.createdAt) >= cutoffDate);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'visitDate':
          aValue = new Date(a.bookingDetails.visitDate);
          bValue = new Date(b.bookingDetails.visitDate);
          break;
        case 'customerName':
          aValue = `${a.customerInfo.firstName} ${a.customerInfo.lastName}`;
          bValue = `${b.customerInfo.firstName} ${b.customerInfo.lastName}`;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleStatusUpdate = async (bookingId, newStatus, statusType) => {
    try {
      const updateData = {};
      if (statusType === 'booking') {
        updateData.bookingStatus = newStatus;
      } else {
        updateData.paymentStatus = newStatus;
      }

      await axios.patch(`http://localhost:5000/api/trip-bookings/${bookingId}`, updateData);
      fetchBookings(); // Refresh the list
      alert(`${statusType === 'booking' ? 'Booking' : 'Payment'} status updated successfully!`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const getStatusBadgeClass = (status, type) => {
    const baseClass = 'status-badge';
    if (type === 'booking') {
      switch (status) {
        case 'confirmed': return `${baseClass} status-confirmed`;
        case 'pending': return `${baseClass} status-pending`;
        case 'cancelled': return `${baseClass} status-cancelled`;
        case 'completed': return `${baseClass} status-completed`;
        default: return baseClass;
      }
    } else {
      switch (status) {
        case 'paid': return `${baseClass} status-paid`;
        case 'pending': return `${baseClass} status-pending`;
        case 'failed': return `${baseClass} status-failed`;
        case 'refunded': return `${baseClass} status-refunded`;
        default: return baseClass;
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const generateBookingsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Bookings Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date and summary
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Generated on: ${currentDate}`, 20, 35);
    doc.text(`Total Bookings: ${filteredBookings.length}`, 20, 45);
    
    // Calculate totals
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const confirmedBookings = filteredBookings.filter(b => b.bookingStatus === 'confirmed').length;
    const pendingBookings = filteredBookings.filter(b => b.bookingStatus === 'pending').length;
    
    doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 20, 55);
    doc.text(`Confirmed: ${confirmedBookings} | Pending: ${pendingBookings}`, 20, 65);
    
    // Prepare table data
    const tableColumns = [
      'Booking Ref',
      'Customer',
      'Email',
      'Item',
      'Type',
      'Visit Date',
      'Amount',
      'Status',
      'Payment'
    ];
    
    const tableRows = filteredBookings.map(booking => [
      booking.bookingReference,
      `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      booking.customerInfo.email,
      booking.itemId ? (booking.itemId.name || booking.itemId.title || 'N/A') : 'N/A',
      booking.bookingType,
      formatDate(booking.bookingDetails.visitDate),
      formatCurrency(booking.totalAmount),
      booking.bookingStatus,
      booking.paymentStatus
    ]);
    
    // Generate table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 75,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [51, 122, 183],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Booking Ref
        1: { cellWidth: 25 }, // Customer
        2: { cellWidth: 30 }, // Email
        3: { cellWidth: 25 }, // Item
        4: { cellWidth: 15 }, // Type
        5: { cellWidth: 20 }, // Visit Date
        6: { cellWidth: 15 }, // Amount
        7: { cellWidth: 15 }, // Status
        8: { cellWidth: 15 }  // Payment
      },
      margin: { left: 10, right: 10 },
      didDrawPage: function (data) {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    });
    
    // Save the PDF
    const fileName = `bookings-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-loading">
          {/* Use the system default progress element for a native look */}
          <progress className="native-progress" />
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-content">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchBookings} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div className="header-content">
          <h1>Booking Management</h1>
          <p>Manage and monitor all customer bookings</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={generateBookingsPDF}
            className="btn btn-primary download-btn"
            title="Download PDF Report"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '8px'}}>
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bookings-controls">
        <div className="search-section">
          <div className="search-input-group">
            <svg className="search-icon" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by booking reference, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Payment:</label>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="destination">Destinations</option>
              <option value="adventure">Adventures</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date:</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="createdAt">Date Created</option>
              <option value="visitDate">Visit Date</option>
              <option value="totalAmount">Amount</option>
              <option value="customerName">Customer Name</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Order:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <button onClick={resetFilters} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Showing {filteredBookings.length} of {bookings.length} bookings</p>
      </div>

      {/* Bookings Table */}
      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking Ref</th>
              <th>Customer</th>
              <th>Item</th>
              <th>Type</th>
              <th>Visit Date</th>
              <th>Amount</th>
              <th>Booking Status</th>
              <th>Payment Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking._id}>
                <td className="booking-ref">{booking.bookingReference}</td>
                <td className="customer-info">
                  <div className="customer-name">
                    {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                  </div>
                  <div className="customer-email">{booking.customerInfo.email}</div>
                </td>
                <td className="item-info">
                  {booking.itemId ? (
                    <div>
                      <div className="item-name">{booking.itemId.name || booking.itemId.title || 'Unknown'}</div>
                      {booking.bookingDetails.numberOfPeople > 1 && (
                        <div className="item-details">{booking.bookingDetails.numberOfPeople} people</div>
                      )}
                    </div>
                  ) : (
                    <span className="item-unknown">Item not found</span>
                  )}
                </td>
                <td>
                  <span className={`type-badge type-${booking.bookingType}`}>
                    {booking.bookingType}
                  </span>
                </td>
                <td>{formatDate(booking.bookingDetails.visitDate)}</td>
                <td className="amount">{formatCurrency(booking.totalAmount)}</td>
                <td>
                  <select 
                    value={booking.bookingStatus}
                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value, 'booking')}
                    className={getStatusBadgeClass(booking.bookingStatus, 'booking')}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <select 
                    value={booking.paymentStatus}
                    onChange={(e) => handleStatusUpdate(booking._id, e.target.value, 'payment')}
                    className={getStatusBadgeClass(booking.paymentStatus, 'payment')}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td>{formatDate(booking.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleView(booking)}
                      className="btn btn-sm btn-info"
                      title="View Details"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="no-bookings">
            <p>No bookings found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="booking-details-grid">
                {/* Booking Information */}
                <div className="detail-section">
                  <h3>Booking Information</h3>
                  <div className="detail-row">
                    <label>Booking Reference:</label>
                    <span>{selectedBooking.bookingReference}</span>
                  </div>
                  <div className="detail-row">
                    <label>Type:</label>
                    <span className={`type-badge type-${selectedBooking.bookingType}`}>
                      {selectedBooking.bookingType}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span className={getStatusBadgeClass(selectedBooking.bookingStatus, 'booking')}>
                      {selectedBooking.bookingStatus}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Payment Status:</label>
                    <span className={getStatusBadgeClass(selectedBooking.paymentStatus, 'payment')}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Created:</label>
                    <span>{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{selectedBooking.customerInfo.firstName} {selectedBooking.customerInfo.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Email:</label>
                    <span>{selectedBooking.customerInfo.email}</span>
                  </div>
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{selectedBooking.customerInfo.phone}</span>
                  </div>
                  {selectedBooking.customerInfo.nationality && (
                    <div className="detail-row">
                      <label>Nationality:</label>
                      <span>{selectedBooking.customerInfo.nationality}</span>
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="detail-section">
                  <h3>Trip Details</h3>
                  <div className="detail-row">
                    <label>Item:</label>
                    <span>{selectedBooking.itemId ? (selectedBooking.itemId.name || selectedBooking.itemId.title || 'Unknown') : 'Item not found'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Visit Date:</label>
                    <span>{formatDate(selectedBooking.bookingDetails.visitDate)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Number of People:</label>
                    <span>{selectedBooking.bookingDetails.numberOfPeople}</span>
                  </div>
                  {selectedBooking.bookingDetails.specialRequests && (
                    <div className="detail-row">
                      <label>Special Requests:</label>
                      <span>{selectedBooking.bookingDetails.specialRequests}</span>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                <div className="detail-section">
                  <h3>Payment Information</h3>
                  <div className="detail-row">
                    <label>Total Amount:</label>
                    <span className="amount-large">{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                  <div className="detail-row">
                    <label>Card Holder:</label>
                    <span>{selectedBooking.paymentInfo.cardHolderName}</span>
                  </div>
                  <div className="detail-row">
                    <label>Card Number:</label>
                    <span>**** **** **** {selectedBooking.paymentInfo.cardNumber.slice(-4)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;