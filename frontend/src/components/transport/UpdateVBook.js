
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateVBook.css";

const URL = "http://localhost:5000/Vbook";

function UpdateVBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    Name: "",
    Sdate: "",
    Edate: "",
    Rtime: "",
    Features: "",
    License: [], // license image URLs
    Amount: "",
    PaymentMethod: "Cash",
    PaymentStatus: "Pending",
    PaymentGateway: "None",
    TransactionId: "",
  });

  const [newLicenseFile, setNewLicenseFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current booking details
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`${URL}/${id}`);
        console.log("📥 Booking response:", res.data);

        const booking = res.data.booking; // ✅ use 'booking'

        if (booking) {
          // Convert file paths to URLs
          const licenseUrls =
            booking.License && booking.License.length > 0
              ? booking.License.map((img) =>
                  `http://localhost:5000/${img.replace(/\\/g, "/")}`
                )
              : [];

          setInputs({
            Name: booking.Name || "",
            Sdate: booking.Sdate
              ? new Date(booking.Sdate).toISOString().split("T")[0]
              : "",
            Edate: booking.Edate
              ? new Date(booking.Edate).toISOString().split("T")[0]
              : "",
            Rtime: booking.Rtime || "",
            Features: booking.Features || "",
            License: licenseUrls,
            Amount: booking.Amount || "",
            PaymentMethod: booking.PaymentMethod || "Cash",
            PaymentStatus: booking.PaymentStatus || "Pending",
            PaymentGateway: booking.PaymentGateway || "None",
            TransactionId: booking.TransactionId || "",
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching booking:", err);
        setLoading(false);
      }
    };

    fetchHandler();
  }, [id]);

  //  Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Handle file change
  const handleFileChange = (e) => {
    setNewLicenseFile(e.target.files[0]);
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Name", inputs.Name);
    formData.append("Sdate", inputs.Sdate);
    formData.append("Edate", inputs.Edate);
    formData.append("Rtime", inputs.Rtime);
    formData.append("Features", inputs.Features);
    formData.append("Amount", inputs.Amount);
    formData.append("PaymentMethod", inputs.PaymentMethod);
    formData.append("PaymentStatus", inputs.PaymentStatus);
    formData.append("PaymentGateway", inputs.PaymentGateway);
    formData.append("TransactionId", inputs.TransactionId);

    if (newLicenseFile) {
      formData.append("License", newLicenseFile); // single file
    }

    try {
      await axios.put(`${URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/tmvbook");
    } catch (error) {
      console.error(" Error updating booking:", error);
    }
  };

  if (loading) {
    return <h2>Loading booking details...</h2>;
  }

  return (
    <div>
      <h1 className="A_form-title">📑 Update Booking</h1>

      <form onSubmit={handleSubmit} className="A_updatevbook-form">
        <div className="A_form-group">
          <label>Name</label>
          <input
            type="text"
            name="Name"
            value={inputs.Name}
            onChange={handleChange}
            className="A_form-input"
          />
        </div>

        <div className="A_form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="Sdate"
            value={inputs.Sdate}
            onChange={handleChange}
            className="A_form-input"
          />
        </div>

        <div className="A_form-group">
          <label>End Date</label>
          <input
            type="date"
            name="Edate"
            value={inputs.Edate}
            onChange={handleChange}
            className="A_form-input"
          />
        </div>

        <div className="A_form-group">
          <label>Return Time</label>
          <input
            type="time"
            name="Rtime"
            value={inputs.Rtime}
            onChange={handleChange}
            className="A_form-input"
          />
        </div>

        <div className="A_form-group">
          <label>Features</label>
          <textarea
            name="Features"
            value={inputs.Features}
            onChange={handleChange}
            className="A_form-input"
          />
        </div>

        <div className="A_form-group">
          <label>Booking Amount (Rs.)</label>
          <input
            type="number"
            name="Amount"
            value={inputs.Amount}
            onChange={handleChange}
            className="A_form-input"
            required
            min="0"
          />
        </div>

        <div className="A_form-group">
          <label>Payment Method</label>
          <select
            name="PaymentMethod"
            value={inputs.PaymentMethod}
            onChange={handleChange}
            className="A_form-input"
          >
            <option value="Cash">Cash on Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <div className="A_form-group">
          <label>Payment Status</label>
          <select
            name="PaymentStatus"
            value={inputs.PaymentStatus}
            onChange={handleChange}
            className="A_form-input"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {inputs.PaymentMethod === "Online" && (
          <>
            <div className="A_form-group">
              <label>Payment Gateway</label>
              <select
                name="PaymentGateway"
                value={inputs.PaymentGateway}
                onChange={handleChange}
                className="A_form-input"
              >
                <option value="Stripe">Stripe</option>
                <option value="PayPal">PayPal</option>
                <option value="Razorpay">Razorpay</option>
                <option value="None">None</option>
              </select>
            </div>

            <div className="A_form-group">
              <label>Transaction ID</label>
              <input
                type="text"
                name="TransactionId"
                value={inputs.TransactionId}
                onChange={handleChange}
                className="A_form-input"
                placeholder="Enter transaction ID"
              />
            </div>
          </>
        )}

        
        <div className="A_form-group">
          <label>Current License</label>
          {inputs.License && inputs.License.length > 0 ? (
            inputs.License.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`License ${index + 1}`}
                className="A_license-image-preview"
              />
            ))
          ) : (
            <p>No license uploaded</p>
          )}
        </div>

        
        <div className="A_form-group">
          <label>Upload New License </label>
          <input
            type="file"
            name="newLicense"
            onChange={handleFileChange}
            accept="image/*"
            className="A_form-input"
          />
        </div>

        <button type="submit" className="A_form-button">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default UpdateVBook;
