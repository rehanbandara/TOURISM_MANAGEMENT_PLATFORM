import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../unified-styles.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    f_name: "",
    l_name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [message, setMessage] = useState(null); // ✅ store popup message
  const [messageType, setMessageType] = useState("success"); // ✅ success or error
  const [showPassword, setShowPassword] = useState(false);

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000); // auto-hide after 3 sec
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/register", form);
      setIsCodeSent(true);
      setTimeout(() => setShowResend(true), 20000);
      showPopup("✅ User registered! Check your email for verification code.", "success");
    } catch (err) {
      showPopup(err.response?.data?.message || "❌ Registration failed", "error");
    }
  };

  const handleVerify = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/verify", {
        email: form.email,
        code,
      });
      showPopup("✅ Email verified! Redirecting...", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showPopup(err.response?.data?.message || "❌ Verification failed", "error");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/resend-code", {
        email: form.email,
      });
      showPopup("📩 New verification code sent!", "success");
      setShowResend(false);
      setTimeout(() => setShowResend(true), 20000);
    } catch (err) {
      showPopup(err.response?.data?.message || "❌ Resend failed", "error");
    }
  };

  return (
    <div className="CH-register-container">
      <div className="CH-register-card">
        {/* ✅ Stylish Popup Message */}
        {message && (
          <div className={`CH-popup-message ${messageType}`}>
            {message}
          </div>
        )}

        {!isCodeSent ? (
          <>
            <h2 className="CH-register-title">Create Account</h2>
            <input
              type="text"
              name="f_name"
              placeholder="First Name"
              value={form.f_name}
              onChange={handleChange}
              className="CH-register-input"
            />
            <input
              type="text"
              name="l_name"
              placeholder="Last Name"
              value={form.l_name}
              onChange={handleChange}
              className="CH-register-input"
            />
            <input
              type="text"
              name="username"
              placeholder="User Name"
              value={form.username}
              onChange={handleChange}
              className="CH-register-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="CH-register-input"
            />
            <div className="CH-password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="CH-register-input"
              />
              <button
                type="button"
                className="CH-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="CH-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="CH-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Phone input with flags */}
            <PhoneInput
              country={"lk"}
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
              placeholder="Enter phone number"
              enableSearch={true}
              searchPlaceholder="Search country..."
            />

            <button onClick={handleRegister} className="CH-register-button">
              Register
            </button>
          </>
        ) : (
          <>
            <h2 className="CH-register-title">Verify Email</h2>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="CH-register-input"
            />
            <button onClick={handleVerify} className="CH-register-button">
              Verify
            </button>
            {showResend && (
              <button onClick={handleResend} className="CH-resend-button">
                Resend Code
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
