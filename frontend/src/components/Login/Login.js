// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Login.css";

// const Login = ({ setUser }) => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [message, setMessage] = useState(null);
//   const [messageType, setMessageType] = useState("success");
//   const [showCreateAccount, setShowCreateAccount] = useState(false); // ✅ Separate state

//   const showPopup = (text, type = "success") => {
//     setMessage(text);
//     setMessageType(type);

//     if (type === "error") {
//       setShowCreateAccount(true); // ✅ Show button if login failed
//     } else {
//       setShowCreateAccount(false); // ✅ Hide button if login succeeds
//     }

//     setTimeout(() => setMessage(null), 3000);
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async () => {
//     try {
//       const res = await axios.post("http://localhost:5000/api/users/login", form);
//       setUser(res.data.user);
//       showPopup("✅ Login successful! Welcome " + res.data.user.f_name, "success");
//       setTimeout(() => navigate("/mainhome"), 1500);
//     } catch (err) {
//       showPopup(err.response?.data?.message || "Login failed", "error");
//     }
//   };

//   return (
//     <div className="body">
//       <div className="login-container">
//         <div className="login-card">
//           {/* ✅ Popup Message */}
//           {message && (
//             <div className={`popup-message ${messageType}`}>
//               {message}
//             </div>
//           )}

//           <h2 className="login-title">Login</h2>
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={form.email}
//             onChange={handleChange}
//             className="login-input"
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={form.password}
//             onChange={handleChange}
//             className="login-input"
//           />
//           <button onClick={handleLogin} className="login-button">
//             Login
//           </button>

          

//           {/* ✅ Button stays visible until next successful login */}
//           {showCreateAccount && (
            
//             <button
//               onClick={() => navigate("/register")}
//               className="create-account-button"
//             >
//               Create Account
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../unified-styles.css";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setShowCreateAccount(type === "error");
    setShowResetPassword(type === "error");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", form);
      setUser(res.data.user);
      showPopup("✅ Login successful! Welcome " + res.data.user.username, "success");
      setTimeout(() => navigate("/mainhome"), 1500);
    } catch (err) {
      showPopup(err.response?.data?.message || "Login failed", "error");
    }
  };

  return (
    <div >
      <div className="CH-login-container">
        <div className="CH-login-card">
          {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}

          <h2 className="CH-login-title">Login</h2>
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

          <button onClick={() => navigate("/staff-login")} className="CH-login-button">
            Staff Login
          </button>

          {showCreateAccount && (
            <button
              onClick={() => navigate("/register")}
              className="CH-create-account-button"
            >
              Create Account
            </button>
          )}

          {showResetPassword && (
            <button
              onClick={() => navigate("/reset-password")}
              className="CH-reset-password-button" 
            >
              Reset Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
