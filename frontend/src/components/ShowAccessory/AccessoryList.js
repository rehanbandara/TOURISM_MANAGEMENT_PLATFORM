import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../../unified-styles.css";

const AccessoryList = () => {
  const [accessories, setAccessories] = useState([]);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState("USD"); 
  const [exchangeRate, setExchangeRate] = useState(302.48);
  const [priceRangeUSD, setPriceRangeUSD] = useState([0, 500]);
  const [priceRangeDisplay, setPriceRangeDisplay] = useState([0, 500]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await axios.get(
          "https://api.exchangerate.host/latest?base=USD&symbols=LKR"
        );
        if (res.data?.rates?.LKR) setExchangeRate(res.data.rates.LKR);
      } catch (err) {
        console.error("Exchange rate fetch error:", err);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (currency === "USD") setPriceRangeDisplay(priceRangeUSD);
    else setPriceRangeDisplay(priceRangeUSD.map((p) => p * exchangeRate));
  }, [currency, exchangeRate, priceRangeUSD]);

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const [minUSD, maxUSD] = priceRangeUSD;
        const res = await axios.get("http://localhost:5000/api/accessories", {
          params: {
            search,
            availability,
            category,
            minPrice: minUSD,
            maxPrice: maxUSD,
          },
        });
        setAccessories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccessories();
  }, [search, availability, category, priceRangeUSD]);

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    if (currency === "USD") {
      setPriceRangeUSD([0, value]);
      setPriceRangeDisplay([0, value]);
    } else {
      setPriceRangeUSD([0, value / exchangeRate]);
      setPriceRangeDisplay([0, value]);
    }
  };

  const convertPrice = (price) => (currency === "USD" ? price : price * exchangeRate);

  return (
    <div>
      
    <div className="CH-accessory-container">
      
      <h1>Shop All</h1>

      <div className="CH-currency-switcher" style={{ marginBottom: "1rem" }}>
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

      <div className="CH-search-bar">
        <input
          type="text"
          placeholder="Search for items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="CH-filters">
        <select onChange={(e) => setAvailability(e.target.value)}>
          <option value="">All Availability</option>
          <option value="In Stock">In Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        

        <div>
          <input
            type="range"
            min="0"
            max={currency === "USD" ? 5000 : 5000 * exchangeRate}
            value={priceRangeDisplay[1]}
            onChange={handlePriceChange}
          />
          <span>
            {currency === "USD"
              ? `$${priceRangeDisplay[0]} - $${priceRangeDisplay[1]}`
              : `Rs. ${priceRangeDisplay[0].toLocaleString()} - Rs. ${priceRangeDisplay[1].toLocaleString()}`}
          </span>
        </div>
      </div>

      <div className="CH-products-grid">
        {accessories.map((item) => (
          <div className="CH-product-card" key={item._id}>
            <img src={item.imagePaths?.[0]} alt={item.itemName} />
            <div className="CH-product-card-content">
              <h4>{item.itemName}</h4>
              <p>
                {currency === "USD"
                  ? `$${convertPrice(item.price).toFixed(2)}`
                  : `Rs. ${convertPrice(item.price).toLocaleString()}`}
              </p>
              <p>{item.availability}</p>
              <button
                onClick={() => navigate(`/accessoryDetails/${item._id}`)}
                style={{
                  padding: "8px 12px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                VIEW DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default AccessoryList;
