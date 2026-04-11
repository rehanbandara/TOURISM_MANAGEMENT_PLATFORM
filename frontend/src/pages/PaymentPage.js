import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PaymentPage.css';

const PaymentPage = () => {
  const { type, id } = useParams(); // type: 'destination' or 'adventure', id: item ID
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  const [formData, setFormData] = useState({
    // Customer Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    
    // Booking Details
    visitDate: '',
    numberOfPeople: 1,
    specialRequests: '',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    
    // Billing Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    fetchItemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      let response;
      
      if (type === 'destination') {
        response = await axios.get(`http://localhost:5000/api/destinations/${id}`);
        setItem(response.data.success ? response.data.data : response.data);
      } else if (type === 'adventure') {
        response = await axios.get(`http://localhost:5000/api/activities/${id}`);
        setItem(response.data.success ? response.data.data : response.data);
      } else {
        setError('Invalid booking type');
        return;
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setFormData(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const calculateTotal = () => {
    const basePrice = type === 'destination' ? (item?.entryFee || 0) : (item?.price || 0);
    return basePrice * formData.numberOfPeople;
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'visitDate',
      'cardNumber', 'expiryDate', 'cvv', 'cardHolderName'
    ];
    
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return false;
      }
    }
    
    // Validate card number (16 digits)
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      return false;
    }
    
    // Validate expiry date (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      return false;
    }
    
    // Validate CVV (3-4 digits)
    if (!/^\d{3,4}$/.test(formData.cvv)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.');
      return;
    }
    
    setProcessing(true);
    
    try {
      const bookingData = {
        bookingType: type,
        itemId: id,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          nationality: formData.nationality
        },
        bookingDetails: {
          visitDate: formData.visitDate,
          numberOfPeople: formData.numberOfPeople,
          specialRequests: formData.specialRequests
        },
        paymentInfo: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for storage
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          cardHolderName: formData.cardHolderName,
          billingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        },
        totalAmount: calculateTotal()
      };

      const response = await axios.post('http://localhost:5000/api/trip-bookings', bookingData);
      
      if (response.data.success) {
        setBookingReference(response.data.data.bookingReference);
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
      
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/'); // Navigate back to home page
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <div className="spinner"></div>
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="payment-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="back-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* Left Side - Item Summary */}
        <div className="payment-summary">
          <h2>Booking Summary</h2>
          <div className="item-card">
            <img 
              src={item.images?.[0] || 'https://via.placeholder.com/300x200'} 
              alt={item.name || item.title}
              className="item-image"
            />
            <div className="item-details">
              <h3>{item.name || item.title}</h3>
              <p className="item-location">{item.location}</p>
              <p className="item-type">{type === 'destination' ? 'Destination' : 'Adventure'}</p>
            </div>
          </div>
          
          <div className="pricing-breakdown">
            <div className="price-row">
              <span>Price per person:</span>
              <span>LKR:{type === 'destination' ? item.entryFee || 0 : item.price || 0}</span>
            </div>
            <div className="price-row">
              <span>Number of people:</span>
              <span>{formData.numberOfPeople}</span>
            </div>
            <div className="price-row total">
              <span>Total Amount:</span>
              <span>LKR:{calculateTotal()}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="payment-form-container">
          <h2>Payment Details</h2>
          <form onSubmit={handleSubmit} className="payment-form">
            {/* Customer Information */}
            <div className="form-section">
              <h3>Customer Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Booking Details */}
            <div className="form-section">
              <h3>Booking Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="visitDate">Visit Date *</label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="numberOfPeople">Number of People *</label>
                  <input
                    type="number"
                    id="numberOfPeople"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="specialRequests">Special Requests</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any special requirements or requests..."
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="form-section">
              <h3>Payment Information</h3>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={(e) => {
                      if (/^\d{0,4}$/.test(e.target.value)) {
                        handleInputChange(e);
                      }
                    }}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="cardHolderName">Card Holder Name *</label>
                <input
                  type="text"
                  id="cardHolderName"
                  name="cardHolderName"
                  value={formData.cardHolderName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>


            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn-secondary"
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={processing}
              >
                {processing ? 'Processing Payment...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <svg width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
              </svg>
            </div>
            <h2>Payment Successful!</h2>
            <p>Your booking has been confirmed.</p>
            <div className="booking-details">
              <p><strong>Booking Reference:</strong> {bookingReference}</p>
              <p><strong>Total Paid:</strong> LKR {calculateTotal().toLocaleString()}</p>
            </div>
            <button onClick={handleSuccessModalClose} className="btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;