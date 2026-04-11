import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./VBook.css";

const URL = "http://localhost:5000/Vbook"; // Backend API
const VEHICLE_URL = "http://localhost:5000/vehicles";

function VBook() {
  const { vehicleId } = useParams(); // Get vehicle ID from URL
  const [formData, setFormData] = useState({
    Name: "",
    VehicleId: "",
    Sdate: "",
    Edate: "",
    Rtime: "",
    Features: "",
    License: null,
    PaymentMethod: "Cash",
    PaymentGateway: "None",
    Amount: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch vehicle details if vehicleId is in URL
  useEffect(() => {
    if (vehicleId) {
      const fetchVehicle = async () => {
        try {
          const res = await axios.get(`${VEHICLE_URL}/${vehicleId}`);
          console.log("Vehicle API Response:", res.data);
          const vehicle = res.data.vehicles || res.data.Vehicles;
          console.log("Vehicle Data:", vehicle);
          if (vehicle) {
            setFormData((prev) => ({
              ...prev,
              VehicleId: vehicle._id,
              Amount: vehicle.pricePerDay || ""
            }));
          }
        } catch (err) {
          console.error("Error fetching vehicle:", err);
        }
      };
      fetchVehicle();
    }
  }, [vehicleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, License: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name || !formData.VehicleId || !formData.Sdate || !formData.Edate || !formData.Rtime || !formData.Amount) {
      alert("Please fill in all required fields!");
      return;
    }

    // If online payment is selected, simulate payment gateway
    if (formData.PaymentMethod === "Online") {
      const transactionId = `TXN${Date.now()}`;
      const data = new FormData();
      data.append("Name", formData.Name);
      data.append("VehicleId", formData.VehicleId);
      data.append("Sdate", formData.Sdate);
      data.append("Edate", formData.Edate);
      data.append("Rtime", formData.Rtime);
      data.append("Features", formData.Features);
      data.append("PaymentMethod", formData.PaymentMethod);
      data.append("PaymentGateway", formData.PaymentGateway);
      data.append("TransactionId", transactionId);
      data.append("Amount", formData.Amount);
      if (formData.License) data.append("License", formData.License);

      setLoading(true);
      try {
        console.log("📤 Sending booking data (Online):", {
          Name: formData.Name,
          VehicleId: formData.VehicleId,
          Amount: formData.Amount
        });
        const response = await axios.post(URL, data, { headers: { "Content-Type": "multipart/form-data" } });
        console.log("✅ Booking response:", response.data);
        alert(`Payment successful! Transaction ID: ${transactionId}\nBooking added successfully!`);
        navigate("/vehi");
      } catch (err) {
        console.error(err);
        alert("Failed to add booking");
      } finally {
        setLoading(false);
      }
    } else {
      // Cash payment
      const data = new FormData();
      data.append("Name", formData.Name);
      data.append("VehicleId", formData.VehicleId);
      data.append("Sdate", formData.Sdate);
      data.append("Edate", formData.Edate);
      data.append("Rtime", formData.Rtime);
      data.append("Features", formData.Features);
      data.append("PaymentMethod", formData.PaymentMethod);
      data.append("PaymentGateway", "None");
      data.append("Amount", formData.Amount);
      if (formData.License) data.append("License", formData.License);

      setLoading(true);
      try {
        console.log("📤 Sending booking data (Cash):", {
          Name: formData.Name,
          VehicleId: formData.VehicleId,
          Amount: formData.Amount
        });
        const response = await axios.post(URL, data, { headers: { "Content-Type": "multipart/form-data" } });
        console.log("✅ Booking response:", response.data);
        alert("Booking added successfully! Payment will be collected on pick up of the vehicle.");
        navigate("/vehi");
      } catch (err) {
        console.error(err);
        alert("Failed to add booking");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="A_tm-container">
      <h1>Vehicle Booking Form</h1>
      <form className="A_booking-form" onSubmit={handleSubmit}>
        <div className="A_form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="A_form-group">
          <label>Vehicle ID</label>
          <input
            type="text"
            value={formData.VehicleId || "No vehicle selected"}
            readOnly
            className="A_form-input"
            style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
          />
        </div>

        <div className="A_form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="Sdate"
            value={formData.Sdate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="A_form-group">
          <label>End Date</label>
          <input
            type="date"
            name="Edate"
            value={formData.Edate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="A_form-group">
          <label>Return Time</label>
          <input
            type="time"
            name="Rtime"
            value={formData.Rtime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="A_form-group">
          <label>Additional Features</label>
          <textarea
            name="Features"
            value={formData.Features}
            onChange={handleChange}
            placeholder="Enter any additional features"
          />
        </div>

        <div className="A_form-group">
          <label>Upload License</label>
          <input
            type="file"
            name="License"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="A_form-group">
          <label>Booking Amount (Rs.)</label>
          <input
            type="number"
            name="Amount"
            value={formData.Amount}
            onChange={handleChange}
            placeholder="Enter booking amount"
            required
            min="0"
          />
        </div>

        <div className="A_form-group">
          <label>Payment Method</label>
          <select
            name="PaymentMethod"
            value={formData.PaymentMethod}
            onChange={handleChange}
            required
          >
            <option value="Cash">Cash</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        {formData.PaymentMethod === "Online" && (
          <div className="A_form-group">
            <label>Payment Gateway</label>
            <select
              name="PaymentGateway"
              value={formData.PaymentGateway}
              onChange={handleChange}
              required
            >
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Razorpay">Razorpay</option>
            </select>
          </div>
        )}

        <button type="submit" className="A_btn A_add-btn" disabled={loading}>
          {loading ? "Processing..." : formData.PaymentMethod === "Online" ? "Pay & Book" : "Add Booking"}
        </button>
      </form>
    </div>
  );
}

export default VBook;
