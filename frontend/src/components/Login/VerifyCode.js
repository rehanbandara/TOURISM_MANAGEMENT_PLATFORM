import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../unified-styles.css";

const VerifyCode = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const [code, setCode] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleVerify = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/verify-code", { email, code });
      showPopup("✅ Code verified!", "success");
      setTimeout(() => navigate("/change-password", { state: { email } }), 1500);
    } catch (err) {
      showPopup("❌ Invalid code", "error");
    }
  };

  return (
    <div className="CH-body">
      <div className="CH-login-container">
        <div className="CH-login-card">
          {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}
          <h2 className="CH-login-title">Enter Verification Code</h2>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="CH-login-input"
          />
          <button onClick={handleVerify} className="CH-login-button">
            Verify Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
