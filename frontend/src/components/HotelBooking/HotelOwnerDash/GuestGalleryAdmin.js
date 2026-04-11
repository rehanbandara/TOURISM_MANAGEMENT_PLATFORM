import React, { useState, useEffect } from "react";
import "./GuestGalleryAdmin.css";


const GuestGalleryAdmin = ({ hotelId, hotelName }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [formData, setFormData] = useState({ userName: "", category: "room", caption: "" });
  const [imageFiles, setImageFiles] = useState([]); // Multiple files
  const [previewImages, setPreviewImages] = useState([]); // For preview
  const [errors, setErrors] = useState({});

  // Fetch all photos for the hotel
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch(hotelId ? `http://localhost:5000/photos/hotel/${hotelId}` : `http://localhost:5000/photos`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data = await res.json();
      setPhotos(data.photos || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, [hotelId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle multiple file input
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = "Name is required.";
    if (!formData.category.trim()) newErrors.category = "Category is required.";
    if (!editingPhoto && imageFiles.length === 0) newErrors.image = "Please upload at least one image.";
    if (formData.caption && formData.caption.length < 5) newErrors.caption = "Caption should be at least 5 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addOrUpdatePhoto = async (id = null) => {
    const formDataToSend = new FormData();
    formDataToSend.append("hotelId", hotelId);
    formDataToSend.append("userName", formData.userName);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("caption", formData.caption);

    imageFiles.forEach(file => formDataToSend.append("photos", file));

    try {
      const url = id ? `http://localhost:5000/photos/${id}` : "http://localhost:5000/photos/upload";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formDataToSend });
      if (!res.ok) throw new Error("Failed to save photo(s)");
      const savedData = await res.json();

      if (id) {
        setPhotos(photos.map(p => p._id === id ? savedData : p));
      } else {
        setPhotos([...photos, ...(savedData.photos || [savedData])]);
      }

      setFormData({ userName: "", category: "room", caption: "" });
      setImageFiles([]);
      setPreviewImages([]);
      setEditingPhoto(null);
      setErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addOrUpdatePhoto(editingPhoto?._id);
  };

  const handleEdit = (photo) => {
    setFormData({ userName: photo.userName, category: photo.category, caption: photo.caption || "" });
    setEditingPhoto(photo);
    setImageFiles([]);
    setPreviewImages([]);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData({ userName: "", category: "room", caption: "" });
    setImageFiles([]);
    setPreviewImages([]);
    setEditingPhoto(null);
    setErrors({});
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await fetch(`http://localhost:5000/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete photo");
      setPhotos(photos.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = { room: "🛏️", food: "🍽️", view: "🌄", facilities: "🏊‍♂️", other: "📸" };
    return icons[category] || "📸";
  };

  if (loading) return <div className="page"><h1>{hotelName} - Guest Gallery</h1><p>Loading...</p></div>;
  if (error) return <div className="page"><h1>{hotelName} - Guest Gallery</h1><p className="error">{error}</p></div>;

  return (
    <div className="page">
    
      <h1>{hotelName} - Guest Photo Gallery</h1>

      <button className="btn-add" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add New Photo(s)"}
      </button>

      {showForm && (
        <div className="form-card">
          <h2>{editingPhoto ? "Edit Photo" : "Add New Photo(s)"}</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label>Your Name:</label>
              <input type="text" name="userName" value={formData.userName} onChange={handleInputChange} />
              {errors.userName && <p className="error-text">{errors.userName}</p>}
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option value="room">🛏️ Room</option>
                <option value="food">🍽️ Food</option>
                <option value="view">🌄 View</option>
                <option value="facilities">🏊‍♂️ Facilities</option>
                <option value="other">📸 Other</option>
              </select>
              {errors.category && <p className="error-text">{errors.category}</p>}
            </div>
            <div className="form-group">
              <label>Caption:</label>
              <textarea name="caption" value={formData.caption} onChange={handleInputChange} rows="3" />
              {errors.caption && <p className="error-text">{errors.caption}</p>}
            </div>
            {!editingPhoto && (
              <div className="form-group">
                <label>Upload Photo(s):</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                {errors.image && <p className="error-text">{errors.image}</p>}
              </div>
            )}

            {previewImages.length > 0 && (
              <div className="preview-grid">
                {previewImages.map((img, idx) => (
                  <img key={idx} src={img} alt={`Preview ${idx + 1}`} />
                ))}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-save">{editingPhoto ? "Update" : "Add"} Photo(s)</button>
              <button type="button" className="btn-cancel" onClick={cancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="gallery-grid">
        {photos.length === 0 ? <p className="no-photos">No photos uploaded yet.</p> :
          photos.map(photo => (
            <div key={photo._id} className="photo-card">
              <div className="photo-image">
                <img
                  src={`http://localhost:5000/${photo.photoPath}`}
                  alt={photo.caption || "Photo"}
                  onError={(e) => e.target.src = "https://via.placeholder.com/200x120?text=No+Image"}
                />
              </div>
              <div className="photo-info">
                <p><strong>{getCategoryIcon(photo.category)} {photo.category}</strong></p>
                <p>{photo.caption || "No caption"}</p>
                <p>By {photo.userName}</p>
              </div>
              <div className="photo-actions">
                <button className="btn-edit" onClick={() => handleEdit(photo)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(photo._id)}>Delete</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default GuestGalleryAdmin;
