import React, { useState, useEffect } from "react";
import "./Hotels.css";


const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "", city: "", desc: "" });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch all hotels
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/hotels");
      if (!response.ok) throw new Error("Failed to fetch hotels");

      const data = await response.json();
      setHotels(data.hotels || data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Hotel name is required.";
    else if (formData.name.length < 3) newErrors.name = "Hotel name must be at least 3 characters.";
    if (!formData.type.trim()) newErrors.type = "Hotel type is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";
    if (!editingHotel && !imageFile) newErrors.image = "Please upload an image.";
    if (formData.desc && formData.desc.length < 10) newErrors.desc = "Description should be at least 10 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addOrUpdateHotel = async (id = null) => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("city", formData.city);
    formDataToSend.append("desc", formData.desc);
    if (imageFile) formDataToSend.append("photos", imageFile);

    try {
      const url = id ? `http://localhost:5000/hotels/${id}` : "http://localhost:5000/hotels";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formDataToSend });
      if (!res.ok) throw new Error("Failed to save hotel");
      const savedHotel = await res.json();
      if (id) {
        setHotels(hotels.map(h => h._id === id ? savedHotel.hotels || savedHotel : h));
      } else {
        setHotels([...hotels, savedHotel.hotels || savedHotel]);
      }
      setFormData({ name: "", type: "", city: "", desc: "" });
      setImageFile(null);
      setEditingHotel(null);
      setErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addOrUpdateHotel(editingHotel?._id);
  };

  const handleEdit = (hotel) => {
    setFormData({ name: hotel.name, type: hotel.type, city: hotel.city, desc: hotel.desc || "" });
    setEditingHotel(hotel);
    setImageFile(null);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData({ name: "", type: "", city: "", desc: "" });
    setEditingHotel(null);
    setImageFile(null);
    setErrors({});
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      const res = await fetch(`http://localhost:5000/hotels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete hotel");
      setHotels(hotels.filter(h => h._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page"><h1>Hotels Management</h1><p>Loading...</p></div>;
  if (error) return <div className="page"><h1>Hotels Management</h1><p className="error">{error}</p></div>;

  return (
    <div className="page">
      
      <h1>Hotels Management</h1>

      <button className="btn-add" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add New Hotel"}
      </button>

      {showForm && (
        <div className="form-card">
          <h2>{editingHotel ? "Edit Hotel" : "Add New Hotel"}</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label>Type:</label>
              <input type="text" name="type" value={formData.type} onChange={handleInputChange} />
              {errors.type && <p className="error-text">{errors.type}</p>}
            </div>
            <div className="form-group">
              <label>City:</label>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div className="form-group">
              <label>Upload Image:</label>
              <input type="file" onChange={handleFileChange} accept="image/*" />
              {errors.image && <p className="error-text">{errors.image}</p>}
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea name="desc" value={formData.desc} onChange={handleInputChange} rows="3" />
              {errors.desc && <p className="error-text">{errors.desc}</p>}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">{editingHotel ? "Update" : "Add"} Hotel</button>
              <button type="button" onClick={cancelEdit} className="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="hotels-grid">
        {hotels.length === 0 ? <p className="no-hotels">No hotels found.</p> :
          hotels.map(hotel => (
            <div key={hotel._id} className="hotel-card">
              <div className="hotel-image">
                <img
                  src={hotel.photos?.[0] ? `http://localhost:5000/${hotel.photos[0]}` : "https://via.placeholder.com/200x120?text=No+Image"}
                  alt={hotel.name}
                  onError={(e)=> e.target.src="https://via.placeholder.com/200x120?text=No+Image"}
                />
              </div>
              <div className="hotel-info">
                <h3>{hotel.name}</h3>
                <p><strong>Type:</strong> {hotel.type}</p>
                <p><strong>City:</strong> {hotel.city}</p>
                <p>{hotel.desc || "No description"}</p>
              </div>
              <div className="hotel-actions">
                <button className="btn-edit" onClick={() => handleEdit(hotel)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(hotel._id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Hotels;
