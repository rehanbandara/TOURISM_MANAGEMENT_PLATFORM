
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Vehicles.css";
import "./Cal.css"; 

const URL = "http://localhost:5000/vehicles";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedVehicleName, setSelectedVehicleName] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("");

  // Hero Slideshow state
  const heroImages = [
    require("./image/Image_6.jpeg"),
    require("./image/Image_9.jpeg"),
    require("./image/Image_10.jpeg"),
    require("./image/Image_4.jpeg"),
    require("./image/Image_8.jpeg"),
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const navigate = useNavigate();

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(URL);
      setVehicles(response.data.Vehicles || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleBooking = (vehicleId) => {
    navigate(`/Vbook/${vehicleId}`);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesName =
      !selectedVehicleName || v.vehicleName === selectedVehicleName;
    const matchesType =
      !selectedVehicleType || v.vehicleType === selectedVehicleType;
    return matchesName && matchesType;
  });

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="A_vehicles-container">
      {/* Hero Slideshow */}
      <div className="A_hero-section">
        <img src={heroImages[currentIndex]} alt="Hero" className="A_hero-image" />
        <div className="A_hero-overlay">
          <h1>Our Vehicles</h1>
          <p>Find the perfect ride for your journey</p>
        </div>
        <div className="A_hero-dots">
          {heroImages.map((_, idx) => (
            <span
              key={idx}
              className={`A_dot ${idx === currentIndex ? "A_active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            ></span>
          ))}
        </div>
      </div>

      <h1>Available Vehicles</h1>

      {/* Filter Bar */}
      <div className="A_filter-bar">
        <select
          value={selectedVehicleName}
          onChange={(e) => setSelectedVehicleName(e.target.value)}
          className="A_filter-input"
        >
          <option value="">Select Vehicle Name</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v.vehicleName}>
              {v.vehicleName}
            </option>
          ))}
        </select>

        <select
          value={selectedVehicleType}
          onChange={(e) => setSelectedVehicleType(e.target.value)}
          className="A_filter-input"
        >
          <option value="">Select Vehicle Type</option>
          {[...new Set(vehicles.map((v) => v.vehicleType))].map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button className="A_load-button">Load</button>
      </div>

      {/* vehicle card display */}

      {filteredVehicles.length === 0 ? (
        <p>No vehicles found</p>
      ) : (
        <div className="A_vehicle-list">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="A_vehicle-card">
              <h3>{vehicle.vehicleName}</h3>
              <p>Type: {vehicle.vehicleType}</p>
              <p>Seats: {vehicle.seat}</p>
              <p>
                <strong>Price/Day:</strong> Rs. {vehicle.pricePerDay}
              </p>
              {vehicle.vehicleImage?.length > 0 &&
                vehicle.vehicleImage.map((img, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5000/${img}`}
                    alt={vehicle.vehicleName}
                    className="A_vehicle-image"
                  />
                ))}
              <button
                onClick={() => handleBooking(vehicle._id)}
                className="A_book-button"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/*  Booking Calculator Section */}
      <BookingCalculator />
    </div>
  );
}

//  Reusable Booking Calculator Component
function BookingCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [features, setFeatures] = useState([]);
  const [total, setTotal] = useState(0);

  const featureOptions = [
    { name: "Driver", pricePerDay: 1000 },
    { name: "Child Seat", pricePerDay: 500 },
    { name: "WiFi", pricePerDay: 400 },
    { name: "Wheelchair ramp", pricePerDay: 300 },
  ];

  const toggleFeature = (feature) => {
    if (features.includes(feature)) {
      setFeatures(features.filter((f) => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  // Auto calculate total

  useEffect(() => {
    if (!startDate || !endDate || vehiclePrice <= 0) {
      setTotal(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; //  minimum 1 day

    if (days <= 0) {
      setTotal(0);
      return;
    }

    const vehicleCost = vehiclePrice * days;
    const featuresCost = features.reduce((sum, fname) => {
      const feature = featureOptions.find((f) => f.name === fname);
      return sum + feature.pricePerDay * days;
    }, 0);

    setTotal(vehicleCost + featuresCost);
  }, [vehiclePrice, startDate, endDate, features]);


  // calculator UI

  return (
    <div className="A_cal-container">
      <h2>Booking Calculator</h2>

      <label>Vehicle Price+ Additional Feature:</label>
      <input
        type="number"
        value={vehiclePrice}
        onChange={(e) => setVehiclePrice(Number(e.target.value))}
      />

      <label>Start Date:</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      <label>End Date:</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <label>Additional Features:</label>
      <div className="A_feature-list">
        {featureOptions.map((f, i) => (
          <div key={i} className="A_feature-item">
            <input
              type="checkbox"
              checked={features.includes(f.name)}
              onChange={() => toggleFeature(f.name)}
            />
            {f.name} (Rs. {f.pricePerDay}/day)
          </div>
        ))}
      </div>

      <h3>
        Total Price: <span>Rs. {total}</span>
      </h3>
    </div>
  );
}

export default Vehicles;
