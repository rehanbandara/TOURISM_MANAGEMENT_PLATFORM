import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import './TMvehicle.css';

const URL = "http://localhost:5000/vehicles"; // Backend URL

function TMvehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newVehicle, setNewVehicle] = useState({
    vehicleName: "",
    vehicleType: "",
    seat: "",
    pricePerDay: "",   //  added
    vehicleImage: null,
  });

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(URL);
      setVehicles(res.data.Vehicles || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch vehicles from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewVehicle((prev) => ({ ...prev, vehicleImage: e.target.files[0] }));
  };


  // Add vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (
      !newVehicle.vehicleName ||
      !newVehicle.vehicleType ||
      !newVehicle.seat ||
      !newVehicle.pricePerDay ||   //  validation
      !newVehicle.vehicleImage
    ) {
      alert("Please fill in all fields and select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("vehicleName", newVehicle.vehicleName);
    formData.append("vehicleType", newVehicle.vehicleType);
    formData.append("seat", newVehicle.seat);
    formData.append("pricePerDay", newVehicle.pricePerDay); //  added
    formData.append("vehicleImage", newVehicle.vehicleImage);

    try {
      const res = await axios.post(URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVehicles([...vehicles, res.data.vehicles]);
      setNewVehicle({
        vehicleName: "",
        vehicleType: "",
        seat: "",
        pricePerDay: "",
        vehicleImage: null,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add vehicle");
    }
  };

  // Delete vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setVehicles(vehicles.filter((v) => v._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete vehicle");
    }
  };

  const navigate = useNavigate();

  const handleUpdate = (vehicleId) => {
    navigate(`/update-vehicle/${vehicleId}`);
  };


  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Transport Management - Vehicles</h1>

      {/* Add Vehicle Form */}
      <form className="A_vehicle-form" onSubmit={handleAddVehicle}>
        <h2>Add New Vehicle</h2>
        <input
          type="text"
          name="vehicleName"
          placeholder="Vehicle Name"
          value={newVehicle.vehicleName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="vehicleType"
          placeholder="Vehicle Type"
          value={newVehicle.vehicleType}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="seat"
          placeholder="Seats"
          value={newVehicle.seat}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="pricePerDay"
          placeholder="Price Per Day"
          value={newVehicle.pricePerDay}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="vehicleImage"
          onChange={handleFileChange}
          accept="image/*"
          required
        />
        <button type="submit" className="A_btn A_add-btn">Add Vehicle</button>
      </form>

      {/* Vehicles Cards */}
      {vehicles.length > 0 ? (
        <div className="A_vehicle-card-container">
          {vehicles.map((vehicle) => (
            <div className="A_vehicle-card" key={vehicle._id}>
              <div className="A_vehicle-img-box">
                {vehicle.vehicleImage && vehicle.vehicleImage.length > 0 ? (
                  <img
                    src={`http://localhost:5000/${vehicle.vehicleImage[0]}`}
                    alt={vehicle.vehicleName}
                    className="A_vehicle-img"
                  />
                ) : (
                  <div className="A_no-image">No Image</div>
                )}
              </div>
              <div className="A_vehicle-info">
                <h3>{vehicle.vehicleName}</h3>
                <p><strong>Type:</strong> {vehicle.vehicleType}</p>
                <p><strong>Seats:</strong> {vehicle.seat}</p>
                <p><strong>Price/Day:</strong> Rs. {vehicle.pricePerDay}</p> {/*  show price */}
                <div className="A_card-actions">
                  <button onClick={() => handleUpdate(vehicle._id)} className="A_update-btn">Update</button>
                  <button onClick={() => handleDelete(vehicle._id)} className="A_delete-btn">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No vehicles found</p>
      )}
    </div>
  );
}

export default TMvehicle;
