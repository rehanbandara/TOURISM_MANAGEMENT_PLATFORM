import React, { useState } from 'react';
import './RoomPayment.css';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';


const RoomPayment = ({ bookingDetails, totalAmount, onPaymentComplete, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // You can add a return_url if you also want redirect behavior
        payment_method_data: {
          billing_details: {
            name: bookingDetails?.name,
            email: bookingDetails?.email,
            phone: bookingDetails?.phone,
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      const paymentData = {
        method: 'stripe',
        amount: (paymentIntent.amount || Math.round(totalAmount * 100)) / 100,
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        timestamp: new Date().toISOString(),
      };
      setProcessing(false);
      onPaymentComplete(paymentData);
    } else {
      setErrorMessage('Payment was not completed.');
      setProcessing(false);
    }
  };

  return (
    <div className="MA-debit-card-payment">
      <div className="MA-payment-header">
        <h2>💳 Card Payment</h2>
        <p className="MA-total-amount">Total: <strong>LKR {totalAmount.toFixed(2)}</strong></p>
      </div>

      <div className="MA-booking-summary-box">
        <h3>Booking Details</h3>
        <div className="MA-summary-details">
          <div className="MA-summary-row">
            <span>Guest Name:</span>
            <span>{bookingDetails?.name}</span>
          </div>
          <div className="MA-summary-row">
            <span>Room Type:</span>
            <span>{bookingDetails?.roomType}</span>
          </div>
          <div className="MA-summary-row">
            <span>Check-In:</span>
            <span>{new Date(bookingDetails?.checkIn).toLocaleDateString()}</span>
          </div>
          <div className="MA-summary-row">
            <span>Check-Out:</span>
            <span>{new Date(bookingDetails?.checkOut).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="MA-payment-form">
        <PaymentElement />

        {errorMessage && <div className="MA-error-message" style={{ marginTop: '8px' }}>{errorMessage}</div>}

        <div className="MA-security-info">
          <div className="MA-security-badge">
            <span className="MA-lock-icon">🔒</span>
            <div>
              <strong>Secure Payment</strong>
              <p>Your card information is encrypted and secure</p>
            </div>
          </div>
          <div className="MA-ssl-badge">
            <span>✓</span> SSL Encrypted
          </div>
        </div>

        <button type="submit" className="MA-btn-pay" disabled={processing || !stripe || !elements}>
          {processing ? (
            <>
              <span className="MA-spinner"></span>
              Processing Payment...
            </>
          ) : (
            `Pay LKR ${totalAmount.toFixed(2)}`
          )}
        </button>
      </form>

      <button className="MA-btn-cancel" onClick={onCancel} disabled={processing}>
        Cancel Payment
      </button>

      <div className="MA-payment-footer">
        <p>By completing this payment, you agree to our Terms & Conditions</p>
      </div>
    </div>
  );
};

export default RoomPayment;