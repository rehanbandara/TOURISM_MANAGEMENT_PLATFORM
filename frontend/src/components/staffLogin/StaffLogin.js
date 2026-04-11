import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";

const StaffLogin = ({ setUser }) => {  // ✅ get setUser as prop
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", type: "" });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Popup message handler
  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password || !form.type) {
      return showPopup("❌ Please fill all fields", "error");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/staff/login", form);

      // ✅ Store staff info in global state
      setUser({
        username: res.data.staff.username,
        type: res.data.staff.type,
        email: res.data.staff.email,
      });

      showPopup(`✅ Welcome ${res.data.staff.username}`, "success");
      setTimeout(() => navigate("/mainhome"), 1200);
    } catch (err) {
      showPopup(err.response?.data?.message || "❌ Wrong email/password", "error");
    }
  };

  return (
    <div className="CH-login-container">
      <div className="CH-login-card">
        {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}
        <h2 className="CH-login-title">Staff Login</h2>

        {/* Staff Type Dropdown */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="CH-login-input"
        >
          <option value="">Select Staff Type</option>
          <option value="Administer">Administer</option>
          <option value="Hotel Owner">Hotel Owner</option>
          <option value="Accessory Handler">Accessory Handler</option>
          <option value="Flight Manager">Flight Manager</option>
          <option value="Transport Manager">Transport Manager</option>
          <option value="Driver">Driver</option>
        </select>

        {/* Email & Password Fields */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="CH-login-input"
        />

        <div className="CH-password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="CH-login-input"
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

        <button onClick={handleLogin} className="CH-login-button">
          Login
        </button>

        <button onClick={() => navigate("/login")} className="CH-login-button">
          User Login
        </button>

        <button
          className="CH-resend-button"
          onClick={() => navigate("/staff-reset")}
        >
          Forgot Password?
        </button>

        
      </div>
    </div>
  );
};

export default StaffLogin;
