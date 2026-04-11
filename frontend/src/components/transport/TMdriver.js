
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TMdriver.css";

const URL = "http://localhost:5000/drivers";

function TMdriver() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newDriver, setNewDriver] = useState({
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
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(URL);
      setDrivers(res.data.drivers);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch drivers from backend");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setDrivers(drivers.filter((driver) => driver._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete driver");
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/driverUpdate/${id}`;
  };

  const handleChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    const { fullname, licence, dob, phone, email, vehicle, vehiNumber, language } = newDriver;
    if (!fullname || !licence || !dob || !phone || !email ||  !language) {
      alert("Please fill in all required fields");
      return;
    }
    try {
      const res = await axios.post(URL, newDriver);
      setDrivers([...drivers, res.data.driver]);
      setNewDriver({ fullname: "", licence: "", dob: "", phone: "", email: "", vehicle: "", vehiNumber: "", language: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add driver");
    }
  };

  if (loading) return <p>Loading drivers...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="A_drivers-container">
      <h1>Transport Management - Drivers</h1>

      {/* Add Driver Form */}
      <form onSubmit={handleAddDriver} className="A_driver-form">
        <h2>Add New Driver</h2>
        <input type="text" name="fullname" placeholder="Full Name" value={newDriver.fullname} onChange={handleChange} />
        <input type="text" name="licence" placeholder="Licence" value={newDriver.licence} onChange={handleChange} />
        <input type="date" name="dob" value={newDriver.dob} onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone" value={newDriver.phone} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={newDriver.email} onChange={handleChange} />
        <input type="text" name="vehicle" placeholder="Vehicle" value={newDriver.vehicle} onChange={handleChange} />
        <input type="text" name="vehiNumber" placeholder="Vehicle Number" value={newDriver.vehiNumber} onChange={handleChange} />
        <input type="text" name="language" placeholder="Language" value={newDriver.language} onChange={handleChange} />
        <button type="submit" className="A_add-btn">Add Driver</button>
      </form>

      {/* Drivers Cards */}
      <div className="A_drivers-grid">
        {drivers.length > 0 ? (
          drivers.map((driver, index) => (
            <div key={driver._id} className="A_driver-card">
              <h3>{driver.fullname}</h3>
              <p><strong>Licence:</strong> {driver.licence}</p>
              <p><strong>DOB:</strong> {new Date(driver.dob).toLocaleDateString()}</p>
              <p><strong>Phone:</strong> {driver.phone}</p>
              <p><strong>Email:</strong> {driver.email}</p>
              <p><strong>Vehicle:</strong> {driver.vehicle}</p>
              <p><strong>Vehicle No:</strong> {driver.vehiNumber}</p>
              <p><strong>Language:</strong> {driver.language}</p>
              <div className="A_card-actions">
                <button onClick={() => handleUpdate(driver._id)} className="A_update-btn">Update</button>
                <button onClick={() => handleDelete(driver._id)} className="A_delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No drivers found</p>
        )}
      </div>
    </div>
  );
}

export default TMdriver;
