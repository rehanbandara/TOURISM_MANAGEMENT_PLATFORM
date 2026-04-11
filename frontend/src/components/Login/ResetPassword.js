// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState(null);
//   const [messageType, setMessageType] = useState("success");
//   const [timer, setTimer] = useState(20);
//   const [canResend, setCanResend] = useState(false);

//   const showPopup = (text, type = "success") => {
//     setMessage(text);
//     setMessageType(type);
//     setTimeout(() => setMessage(null), 3000);
//   };

//   const handleSendCode = async () => {
//     try {
//       await axios.post("http://localhost:5000/api/users/send-code", { email });
//       showPopup("📧 Verification code sent!", "success");
//       setCanResend(false);
//       setTimer(20);
//       let countdown = 20;
//       const interval = setInterval(() => {
//         countdown--;
//         setTimer(countdown);
//         if (countdown <= 0) {
//           clearInterval(interval);
//           setCanResend(true);
//         }
//       }, 1000);
//       setTimeout(() => navigate("/verify-code", { state: { email } }), 1500);
//     } catch (err) {
//       showPopup("❌ Failed to send code", "error");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         {message && <div className={`popup-message ${messageType}`}>{message}</div>}
//         <h2 className="login-title">Reset Password</h2>
//         <input
//           type="email"
//           placeholder="Enter your email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="login-input"
//         />
//         <button onClick={handleSendCode} className="login-button">
//           Send Code
//         </button>
//         {canResend ? (
//           <button onClick={handleSendCode} className="resend-button">
//             Resend Code
//           </button>
//         ) : (
//           <p className="timer-text">⏳ Wait {timer}s</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;


import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef(null); // To store interval reference

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const startCountdown = () => {
    clearInterval(intervalRef.current); // ✅ Prevent multiple intervals
    setCanResend(false);
    let countdown = 20;
    setTimer(countdown);

    intervalRef.current = setInterval(() => {
      countdown--;
      setTimer(countdown);
      if (countdown <= 0) {
        clearInterval(intervalRef.current);
        setCanResend(true);
      }
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email) return showPopup("⚠️ Please enter your email", "error");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/users/send-code", { email });
      showPopup("📧 Verification code sent!", "success");
      startCountdown();
      setTimeout(() => navigate("/verify-code", { state: { email } }), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Failed to send code";
      showPopup(errorMsg, "error");
    } finally {
      setLoading(false);
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
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="CH-login-input"
          />
          <button
            onClick={handleSendCode}
            className="CH-login-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Code"}
          </button>

          {canResend ? (
            <button onClick={handleSendCode} className="CH-resend-button">
              Resend Code
            </button>
          ) : (
            <p className="CH-timer-text">⏳ Wait {timer}s</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
