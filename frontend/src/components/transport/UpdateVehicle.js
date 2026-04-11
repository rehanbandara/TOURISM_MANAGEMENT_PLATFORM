
// src/components/transport/UpdateVehicle.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateVehicle.css";

const URL = "http://localhost:5000/vehicles";

function UpdateVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    vehicleName: "",
    vehicleType: "",
    seat: "",
    pricePerDay: "",   
    vehicleImage: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Fetch vehicle details
  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const res = await axios.get(`${URL}/${id}`);
        console.log("📥 Vehicle response:", res.data);

        const data = res.data;
        let vehicle = data.vehicles || data;

        const imageUrl =
          vehicle.vehicleImage && vehicle.vehicleImage.length > 0
            ? `http://localhost:5000/${vehicle.vehicleImage[0].replace(/\\/g, "/")}`
            : "";

        setInputs({
          vehicleName: vehicle.vehicleName || "",
          vehicleType: vehicle.vehicleType || "",
          seat: vehicle.seat || "",
          pricePerDay: vehicle.pricePerDay || "", //  load value
          vehicleImage: imageUrl,
        });

        setLoading(false);
      } catch (err) {
        console.error(" Error fetching vehicle:", err);
        setLoading(false);
      }
    };

    fetchHandler();
  }, [id]);

  //  Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //  Handle file change
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  //  Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("vehicleName", inputs.vehicleName);
    formData.append("vehicleType", inputs.vehicleType);
    formData.append("seat", inputs.seat);
    formData.append("pricePerDay", inputs.pricePerDay); //  send price

    if (imageFile) {
      formData.append("vehicleImage", imageFile);
    } else if (inputs.vehicleImage) {
      formData.append("vehicleImage", inputs.vehicleImage);
    }

    try {
      await axios.put(`${URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/tmvehicle");
    } catch (error) {
      console.error("❌ Error updating vehicle:", error);
    }
  };

  if (loading) {
    return <h2>Loading vehicle details...</h2>;
  }

  return (
    <div>
      <h1 className="A_form-title">🚙 Update Vehicle</h1>
      <form onSubmit={handleSubmit} className="A_updatevehicle-form">
        {/* Vehicle Name */}
        <div className="A_form-group">
          <label>Vehicle Name</label>
          <input
            type="text"
            name="vehicleName"
            value={inputs.vehicleName}
            onChange={handleChange}
            className="A_form-input"
            required
          />
        </div>

        {/* Vehicle Type */}
        <div className="A_form-group">
          <label>Vehicle Type</label>
          <input
            type="text"
            name="vehicleType"
            value={inputs.vehicleType}
            onChange={handleChange}
            className="A_form-input"
            required
          />
        </div>

        {/* Seats */}
        <div className="A_form-group">
          <label>Seats</label>
          <input
            type="number"
            name="seat"
            value={inputs.seat}
            onChange={handleChange}
            className="A_form-input"
            required
          />
        </div>

        {/*  Price Per Day */}
        <div className="A_form-group">
          <label>Price Per Day (Rs.)</label>
          <input
            type="number"
            name="pricePerDay"
            value={inputs.pricePerDay}
            onChange={handleChange}
            className="A_form-input"
            required
          />
        </div>

        {/* Current Image */}
        <div className="A_form-group">
          <label>Current Vehicle Image</label>
          {inputs.vehicleImage ? (
            <img
              src={inputs.vehicleImage}
              alt="Current Vehicle"
              className="A_vehicle-image-preview"
            />
          ) : (
            <p>No image uploaded</p>
          )}
        </div>

        {/* Upload New Image */}
        <div className="A_form-group">
          <label>Upload New Image (Optional)</label>
          <input
            type="file"
            name="newVehicleImage"
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

export default UpdateVehicle;
