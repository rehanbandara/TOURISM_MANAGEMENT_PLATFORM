import React, { useState, useEffect } from "react";
import "./GuestGallery.css";

const GuestGallery = ({ hotelId, hotelName, userId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState("all");

  const [uploadForm, setUploadForm] = useState({
    userName: "",
    category: "room",
    caption: "",
    photos: []
  });

  const [previewImages, setPreviewImages] = useState([]);

  // Fetch photos when component mounts or hotelId changes
  useEffect(() => {
    fetchGalleryPhotos();
  }, [hotelId]);

  const fetchGalleryPhotos = async () => {
    try {
      const res = await fetch(`http://localhost:5000/gallery/hotel/${hotelId}`);
      const data = await res.json();
      setPhotos(data.photos || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setLoading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadForm(prev => ({ ...prev, photos: files }));
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit upload form
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (uploadForm.photos.length === 0) {
      alert("Please select at least one photo");
      return;
    }

    const formData = new FormData();
    formData.append("hotelId", hotelId);
    formData.append("userId", userId); // send userId from props or auth context
    formData.append("userName", uploadForm.userName);
    formData.append("category", uploadForm.category);
    formData.append("caption", uploadForm.caption);

    uploadForm.photos.forEach(photo => formData.append("photos", photo));

    try {
      const response = await fetch("http://localhost:5000/gallery/upload", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Photos uploaded successfully! They will appear after admin approval.");
        setShowUploadModal(false);
        setUploadForm({
          userName: "",
          category: "room",
          caption: "",
          photos: []
        });
        setPreviewImages([]);
        fetchGalleryPhotos();
      } else {
        const errData = await response.json();
        console.error("Upload error:", errData);
        alert("Failed to upload photos: " + errData.message);
      }
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Error uploading photos");
    }
  };

  const filteredPhotos = filter === "all"
    ? photos
    : photos.filter(p => p.category === filter);

  const getCategoryIcon = (category) => {
    const icons = {
      room: "🛏️",
      food: "🍽️",
      view: "🌄",
      amenities: "🏊‍♂️",
      other: "📸"
    };
    return icons[category] || "📸";
  };

  if (loading) return <div className="MA-gallery-loading">Loading gallery...</div>;

  return (
    <div className="MA-guest-gallery-container">
      {/* Header */}
      <div className="MA-gallery-header">
        <div>
          <h2>Guest Photo Gallery</h2>
          <p>Real photos shared by real guests at {hotelName}</p>
        </div>
        <button className="MA-upload-photo-btn" onClick={() => setShowUploadModal(true)}>
          📷 Share Your Photos
        </button>
      </div>

      {/* Filters */}
      <div className="MA-gallery-filters">
        {["all", "room", "food", "view", "amenities"].map(cat => (
          <button
            key={cat}
            className={filter === cat ? "MA-active" : ""}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? `All Photos (${photos.length})` : `${getCategoryIcon(cat)} ${cat} (${photos.filter(p => p.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="MA-no-photos">
          <p>No photos yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="MA-gallery-grid">
          {filteredPhotos.map(photo => (
            <div key={photo._id} className="MA-gallery-card" onClick={() => setSelectedImage(photo)}>
              <img
                src={`http://localhost:5000/${photo.photoPath}`}
                alt={photo.caption}
                className="MA-gallery-image"
              />
              <div className="MA-gallery-overlay">
                <span className="MA-category-badge">
                  {getCategoryIcon(photo.category)} {photo.category}
                </span>
                <p className="MA-photo-caption">{photo.caption}</p>
                <p className="MA-guest-info">By {photo.userName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="MA-gallery-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="MA-gallery-modal" onClick={e => e.stopPropagation()}>
            <button className="MA-close-modal" onClick={() => setShowUploadModal(false)}>×</button>
            <h2>Share Your Experience</h2>
            <form onSubmit={handleUploadSubmit} className="MA-upload-form">
              <div className="MA-form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  name="userName"
                  value={uploadForm.userName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="MA-form-group">
                <label>Category *</label>
                <select name="category" value={uploadForm.category} onChange={handleInputChange} required>
                  <option value="room">🛏️ Room</option>
                  <option value="food">🍽️ Food</option>
                  <option value="view">🌄 View</option>
                  <option value="amenities">🏊‍♂️ Amenities</option>
                </select>
              </div>

              <div className="MA-form-group">
                <label>Caption</label>
                <textarea name="caption" value={uploadForm.caption} onChange={handleInputChange} placeholder="Share your thoughts..." rows="3" />
              </div>

              <div className="MA-form-group">
                <label>Upload Photos * (Max 5)</label>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} required />
                <p className="MA-help-text">You can select multiple photos (up to 5)</p>
              </div>

              {previewImages.length > 0 && (
                <div className="MA-preview-grid">
                  {previewImages.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx + 1}`} />
                  ))}
                </div>
              )}

              <button type="submit" className="MA-submit-upload-btn">Upload Photos</button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="MA-lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="MA-lightbox-content">
            <button className="MA-close-lightbox" onClick={() => setSelectedImage(null)}>×</button>
            <img src={`http://localhost:5000/${selectedImage.photoPath}`} alt={selectedImage.caption} />
            <div className="MA-lightbox-info">
              <span className="MA-category-badge">{getCategoryIcon(selectedImage.category)} {selectedImage.category}</span>
              <h3>{selectedImage.caption}</h3>
              <p>Shared by {selectedImage.userName}</p>
              <p className="MA-upload-date">{new Date(selectedImage.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestGallery;
