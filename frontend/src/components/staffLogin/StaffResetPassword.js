import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";

const StaffResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSendCode = async () => {
    try {
      await axios.post("http://localhost:5000/api/staff/send-code", { email });
      showPopup("📧 Code sent to email!", "success");
      setCanResend(false);
      let countdown = 20;
      setTimer(countdown);
      const interval = setInterval(() => {
        countdown--;
        setTimer(countdown);
        if (countdown <= 0) {
          clearInterval(interval);
          setCanResend(true);
        }
      }, 1000);
      setTimeout(() => navigate("/staff-verify", { state: { email } }), 1500);
    } catch (err) {
      showPopup("❌ Failed to send code", "error");
    }
  };

  return (
    <div className="CH-body">
      <div className="CH-login-container">
        <div className="CH-login-card">
          {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}
          <h2 className="CH-login-title">Reset Password</h2>
          <input
            type="email"
            placeholder="Enter staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="CH-login-input"
          />
          <button onClick={handleSendCode} className="CH-login-button">
            Send Code
          </button>
          {!canResend ? (
            <p className="CH-timer-text">⏳ Wait {timer}s</p>
          ) : (
            <button onClick={handleSendCode} className="CH-resend-button">
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffResetPassword;
