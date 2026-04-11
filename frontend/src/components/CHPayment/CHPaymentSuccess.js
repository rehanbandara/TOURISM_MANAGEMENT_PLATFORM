import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../unified-styles.css";

const CHPaymentSuccess = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    verifyPaymentAndCreateBooking();
  }, [sessionId]);

  const verifyPaymentAndCreateBooking = async () => {
    try {
      console.log("🔍 Verifying payment for session:", sessionId);
      
      // Verify payment with Stripe
      const verifyResponse = await axios.get(
        `http://localhost:5000/api/stripe/verify-payment/${sessionId}`
      );

      console.log("✅ Verify response:", verifyResponse.data);

      if (verifyResponse.data.success) {
        const metadata = verifyResponse.data.metadata;
        console.log("📦 Metadata received:", metadata);

        // Create booking in database
        console.log("💾 Creating booking in database...");
        const bookingResponse = await axios.post("http://localhost:5000/api/bookings/create", {
          userId: metadata.userId,
          userEmail: metadata.userEmail,
          fullName: metadata.fullName,
          phoneNumber: metadata.phoneNumber,
          address: {
            street: metadata.addressStreet,
            city: metadata.addressCity,
            state: metadata.addressState,
            zipCode: metadata.addressZipCode,
            country: metadata.addressCountry,
          },
          accessoryId: metadata.accessoryId,
          itemName: metadata.itemName,
          itemPrice: parseFloat(metadata.itemPrice),
          quantity: parseInt(metadata.quantity),
          imagePath: metadata.imagePath,
          totalAmount: parseFloat(metadata.itemPrice) * parseInt(metadata.quantity),
          currency: verifyResponse.data.session.currency.toUpperCase(),
          stripePaymentId: verifyResponse.data.session.payment_intent,
          stripeSessionId: sessionId,
          specialInstructions: metadata.specialInstructions,
        });

        console.log("✅ Booking created:", bookingResponse.data);
        setBooking(bookingResponse.data.booking);
        setSuccess(true);
      } else {
        const errorMsg = verifyResponse.data.message || "Payment verification failed";
        console.error("❌ Verification failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("❌ Error in payment process:", err);
      console.error("Error response:", err.response?.data);
      
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "Failed to process payment. Please check console for details.";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/${booking._id}/pdf`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${booking.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download receipt");
    }
  };

  const handleEmailReceipt = async () => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${booking._id}/email`);
      alert("✅ Receipt sent to your email!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("❌ Failed to send email");
    }
  };

  if (loading) {
    return (
      <div className="CH-payment-status-container">
        <div className="CH-payment-card">
          <div className="CH-loading-spinner"></div>
          <h2>Processing your payment...</h2>
          <p>Please wait while we confirm your order</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="CH-payment-status-container">
        <div className="CH-payment-card CH-error-card">
          <div className="CH-status-icon CH-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2>Payment Failed</h2>
          <p>{error}</p>
          <div className="CH-payment-actions">
            <button className="CH-back-button" onClick={() => navigate("/itemlist")}>
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success && booking) {
    return (
      <div className="CH-payment-status-container">
        <div className="CH-payment-card CH-success-card">
          <div className="CH-status-icon CH-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2>Payment Successful!</h2>
          <p className="CH-success-message">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          <div className="CH-order-info-box">
            <div className="CH-order-info-row">
              <span className="CH-info-label">Order Number:</span>
              <span className="CH-info-value">{booking.orderNumber}</span>
            </div>
            <div className="CH-order-info-row">
              <span className="CH-info-label">Item:</span>
              <span className="CH-info-value">{booking.itemName}</span>
            </div>
            <div className="CH-order-info-row">
              <span className="CH-info-label">Quantity:</span>
              <span className="CH-info-value">{booking.quantity}</span>
            </div>
            <div className="CH-order-info-row">
              <span className="CH-info-label">Total Amount:</span>
              <span className="CH-info-value CH-total-highlight">
                {booking.currency === "USD" ? "$" : "Rs. "}
                {booking.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="CH-order-info-row">
              <span className="CH-info-label">Status:</span>
              <span className="CH-status-badge CH-completed-badge">
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="CH-receipt-actions">
            <button className="CH-download-button" onClick={handleDownloadPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Receipt
            </button>

            <button className="CH-email-button" onClick={handleEmailReceipt}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Email Receipt
            </button>
          </div>

          <div className="CH-payment-actions">
            <button className="CH-primary-button" onClick={() => navigate("/my-bookings")}>
              View My Orders
            </button>
            <button className="CH-secondary-button" onClick={() => navigate("/itemlist")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CHPaymentSuccess;

