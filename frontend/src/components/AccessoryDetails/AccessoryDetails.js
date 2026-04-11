import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "../../unified-styles.css";

const AccessoryDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [accessory, setAccessory] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(302.48);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    const fetchAccessory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/accessories/${id}`);
        setAccessory(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const res = await axios.get(
          "https://api.exchangerate.host/latest?base=USD&symbols=LKR"
        );
        if (res.data?.rates?.LKR) setExchangeRate(res.data.rates.LKR);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAccessory();
    fetchExchangeRate();
  }, [id]);

  const convertPrice = (price) => (currency === "USD" ? price : price * exchangeRate);

  const showPopup = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBuyNow = () => {
    console.log("🛒 Buy Now clicked. User:", user);
    
    // Check if user is logged in
    if (!user) {
      showPopup("❌ Please login to purchase this item", "error");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Check if user is a student
    if (user.type && user.type !== "student") {
      showPopup("❌ Only students can purchase accessories", "error");
      return;
    }

    console.log("✅ User verified, navigating to checkout");
    
    // Navigate to checkout with accessory details
    navigate("/checkout", {
      state: {
        accessory,
        currency,
        exchangeRate,
      },
    });
  };

  if (!accessory) return <div className="CH-accessory-details-container"><p>Loading...</p></div>;

  return (
    <div>
      {message && <div className={`CH-popup-message ${messageType}`}>{message}</div>}
      
    <div className="CH-accessory-details-container">
      
      <div className="CH-details-card">
        
        <h2>{accessory.itemName}</h2>

        <div className="CH-images-section">
          {accessory.imagePaths.map((img, i) => (
            <img key={i} src={img} alt={`${accessory.itemName} ${i}`} />
          ))}
        </div>

        <p className="CH-price">
          Price:{" "}
          {currency === "USD"
            ? `$${convertPrice(accessory.price).toFixed(2)}`
            : `Rs. ${convertPrice(accessory.price).toLocaleString()}`}
        </p>

        <p className="CH-availability">Availability: {accessory.availability}</p>
        <p className="CH-small-intro">{accessory.smallIntro}</p>
        <p className="CH-description">{accessory.description}</p>

        {/* Currency selector */}
        <div className="CH-currency-switcher" style={{ margin: "1rem 0" }}>
          <label htmlFor="currency">Currency: </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="LKR">LKR (Rs)</option>
          </select>
        </div>


        

        {/* At bottom of details-card */}
        <button className="CH-buy-now-button" onClick={handleBuyNow}>
        Buy Now
        </button>

        <button className="CH-back-button" onClick={() => navigate(-1)}>
        ← Back
        </button>
        
      </div>
    </div>
    </div>
  );
};

export default AccessoryDetails;
