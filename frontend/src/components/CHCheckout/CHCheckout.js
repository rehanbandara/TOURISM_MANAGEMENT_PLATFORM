import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../unified-styles.css";

const CHCheckout = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessory, currency, exchangeRate } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const [formData, setFormData] = useState({
    fullName: user?.username || "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    quantity: 1,
    specialInstructions: "",
  });

  useEffect(() => {
    // Give time for user to load from localStorage
    const checkUser = setTimeout(() => {
      if (!user) {
        showPopup("❌ Please login to continue", "error");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!accessory) {
        showPopup("❌ No accessory selected", "error");
        setTimeout(() => navigate("/itemlist"), 2000);
        return;
      }

      // Check if user is a student
      if (user.type && user.type !== "student") {
        showPopup("❌ Only students can purchase accessories", "error");
        setTimeout(() => navigate(-1), 2000);
        return;
      }
    }, 100); // Small delay to let localStorage load

    return () => clearTimeout(checkUser);
  }, [user, accessory, navigate]);

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const convertPrice = (price) => {
    return currency === "USD" ? price : price * exchangeRate;
  };

  const calculateTotal = () => {
    return convertPrice(accessory.price) * formData.quantity;
  };

  const handleProceedToPayment = async () => {
    // Validation
    if (!formData.fullName || !formData.phoneNumber) {
      return showPopup("❌ Please fill in all required fields", "error");
    }

    if (
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.zipCode ||
      !formData.address.country
    ) {
      return showPopup("❌ Please complete your address", "error");
    }

    if (formData.quantity < 1) {
      return showPopup("❌ Quantity must be at least 1", "error");
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();

      console.log("Creating checkout session...");

      // Create Stripe checkout session
      const response = await axios.post("http://localhost:5000/api/stripe/create-checkout-session", {
        itemName: accessory.itemName,
        itemPrice: convertPrice(accessory.price),
        quantity: formData.quantity,
        currency: currency,
        userId: user.email || user.username,
        userEmail: user.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        accessoryId: accessory._id,
        imagePath: accessory.imagePaths?.[0] || "",
        specialInstructions: formData.specialInstructions,
      });

      if (response.data && response.data.url) {
        console.log("Redirecting to Stripe checkout...");
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setLoading(false);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data.message || error.response.data.error || "Server error";
        showPopup(`❌ ${errorMessage}`, "error");
      } else if (error.request) {
        // Request made but no response
        showPopup("❌ Cannot connect to server. Please ensure the backend is running.", "error");
      } else {
        // Other errors
        showPopup(`❌ ${error.message || "Failed to proceed to payment"}`, "error");
      }
    }
  };

  if (!accessory) {
    return <div className="CH-checkout-container">Loading...</div>;
  }

  return (
    <div className="CH-checkout-container">
      {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}

      <div className="CH-checkout-wrapper">
        {/* Left Side - Checkout Form */}
        <div className="CH-checkout-form-section">
          <h2 className="CH-checkout-title">Checkout</h2>
          <p className="CH-checkout-subtitle">Complete your purchase in 2 easy steps</p>

          <div className="CH-checkout-progress">
            <div className="CH-progress-step CH-active">
              <div className="CH-step-number">1</div>
              <div className="CH-step-label">Details</div>
            </div>
            <div className="CH-progress-line"></div>
            <div className="CH-progress-step">
              <div className="CH-step-number">2</div>
              <div className="CH-step-label">Payment</div>
            </div>
          </div>

          <form className="CH-checkout-form">
            <div className="CH-form-section">
              <h3 className="CH-section-title">Personal Information</h3>

              <div className="CH-form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="CH-checkout-input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="CH-form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <PhoneInput
                  country={"lk"}
                  value={formData.phoneNumber}
                  onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
                  placeholder="Enter phone number"
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                />
              </div>
            </div>

            <div className="CH-form-section">
              <h3 className="CH-section-title">Shipping Address</h3>

              <div className="CH-form-group">
                <label htmlFor="address.street">Street Address *</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="CH-checkout-input"
                  placeholder="Street address, apartment, suite, etc."
                  required
                />
              </div>

              <div className="CH-form-row">
                <div className="CH-form-group">
                  <label htmlFor="address.city">City *</label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="CH-checkout-input"
                    placeholder="City"
                    required
                  />
                </div>

                <div className="CH-form-group">
                  <label htmlFor="address.state">State/Province *</label>
                  <input
                    type="text"
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="CH-checkout-input"
                    placeholder="State or Province"
                    required
                  />
                </div>
              </div>

              <div className="CH-form-row">
                <div className="CH-form-group">
                  <label htmlFor="address.zipCode">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    id="address.zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="CH-checkout-input"
                    placeholder="ZIP code"
                    required
                  />
                </div>

                <div className="CH-form-group">
                  <label htmlFor="address.country">Country *</label>
                  <input
                    type="text"
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="CH-checkout-input"
                    placeholder="Country"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="CH-form-section">
              <h3 className="CH-section-title">Order Details</h3>

              <div className="CH-form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="CH-checkout-input"
                  min="1"
                  required
                />
              </div>

              <div className="CH-form-group">
                <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  className="CH-checkout-textarea"
                  placeholder="Any special delivery or handling instructions..."
                  rows="4"
                />
              </div>
            </div>
          </form>

          <div className="CH-checkout-actions">
            <button
              type="button"
              className="CH-back-button"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              ← Back
            </button>
            <button
              type="button"
              className="CH-proceed-button"
              onClick={handleProceedToPayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed to Payment →"}
            </button>
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="CH-order-summary-section">
          <h3 className="CH-summary-title">Order Summary</h3>

          <div className="CH-summary-product">
            {accessory.imagePaths && accessory.imagePaths[0] && (
              <img
                src={accessory.imagePaths[0]}
                alt={accessory.itemName}
                className="CH-summary-image"
              />
            )}
            <div className="CH-summary-details">
              <h4 className="CH-product-name">{accessory.itemName}</h4>
              <p className="CH-product-intro">{accessory.smallIntro}</p>
            </div>
          </div>

          <div className="CH-summary-pricing">
            <div className="CH-pricing-row">
              <span>Unit Price:</span>
              <span className="CH-price-value">
                {currency === "USD"
                  ? `$${convertPrice(accessory.price).toFixed(2)}`
                  : `Rs. ${convertPrice(accessory.price).toLocaleString()}`}
              </span>
            </div>

            <div className="CH-pricing-row">
              <span>Quantity:</span>
              <span className="CH-price-value">{formData.quantity}</span>
            </div>

            <div className="CH-pricing-divider"></div>

            <div className="CH-pricing-row CH-total-row">
              <span>Total:</span>
              <span className="CH-total-value">
                {currency === "USD"
                  ? `$${calculateTotal().toFixed(2)}`
                  : `Rs. ${calculateTotal().toLocaleString()}`}
              </span>
            </div>
          </div>

          <div className="CH-summary-info">
            <div className="CH-info-item">
              <svg className="CH-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure payment via Stripe</span>
            </div>

            <div className="CH-info-item">
              <svg className="CH-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span>Free shipping on all orders</span>
            </div>

            <div className="CH-info-item">
              <svg className="CH-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CHCheckout;

