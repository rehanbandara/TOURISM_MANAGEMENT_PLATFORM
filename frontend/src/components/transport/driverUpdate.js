import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./TMdriver.css";

const URL = "http://localhost:5000/drivers";

function DriverUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [driver, setDriver] = useState({
    fullname: "",
    licence: "",
    dob: "",
    phone: "",
    email: "",
    vehicle: "",
    vehiNumber: "",
    language: "",
  });

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const fetchDriver = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/${id}`);
      setDriver(res.data.driver);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch driver details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setDriver({ ...driver, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { fullname, licence, dob, phone, email, vehicle, vehiNumber, language } = driver;
    if (!fullname || !licence || !dob || !phone || !email || !language) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      await axios.put(`${URL}/${id}`, driver);
      alert("Driver updated successfully!");
      navigate("/tmdriver"); // Navigate back to TMdriver page
    } catch (err) {
      console.error(err);
      alert("Failed to update driver");
    }
  };

  const handleCancel = () => {
    navigate("/tmdriver"); // Navigate back to TMdriver page
  };

  if (loading) return <p>Loading driver details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="A_drivers-container">
      <h1>Update Driver</h1>
      
      <form onSubmit={handleUpdate} className="A_driver-form A_update-form">
        <h2>Update Driver Information</h2>
        <input 
          type="text" 
          name="fullname" 
          placeholder="Full Name" 
          value={driver.fullname} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="licence" 
          placeholder="Licence" 
          value={driver.licence} 
          onChange={handleChange} 
        />
        <input 
          type="date" 
          name="dob" 
          value={driver.dob} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="phone" 
          placeholder="Phone" 
          value={driver.phone} 
          onChange={handleChange} 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={driver.email} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="vehicle" 
          placeholder="Vehicle" 
          value={driver.vehicle} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="vehiNumber" 
          placeholder="Vehicle Number" 
          value={driver.vehiNumber} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="language" 
          placeholder="Language" 
          value={driver.language} 
          onChange={handleChange} 
        />
        <div className="A_form-actions">
          <button type="submit" className="A_update-btn">Update Driver</button>
          <button type="button" onClick={handleCancel} className="A_cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default DriverUpdate;
