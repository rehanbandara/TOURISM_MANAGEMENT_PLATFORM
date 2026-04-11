import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../unified-styles.css";

const UpdateAccessory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    itemName: "",
    smallIntro: "",
    description: "",
    price: "",
    availability: "In Stock",
  });

  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch single accessory by ID
  useEffect(() => {
    const fetchAccessory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/accessories/${id}`);
        const accessory = await res.json();

        if (accessory) {
          setForm({
            itemName: accessory.itemName,
            smallIntro: accessory.smallIntro,
            description: accessory.description,
            price: accessory.price,
            availability: accessory.availability,
          });
          setCurrentImages(accessory.imagePaths || []);
        }
      } catch (err) {
        console.error("Error fetching accessory:", err);
        setMessage("Error loading accessory data");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Show preview of uploaded images
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalAfterUpload = currentImages.length + newImages.length + selectedFiles.length;

    if (totalAfterUpload > 3) {
      setMessage(`Cannot upload ${selectedFiles.length} image(s). Maximum 3 images allowed (currently have ${currentImages.length + newImages.length}).`);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const previewFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewImages([...newImages, ...previewFiles]);
  };

  const handleRemoveImage = (index, type) => {
    if (type === "current") {
      const updatedImages = [...currentImages];
      updatedImages.splice(index, 1);
      setCurrentImages(updatedImages);
    } else {
      const updatedNewImages = [...newImages];
      updatedNewImages.splice(index, 1);
      setNewImages(updatedNewImages);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const totalImages = currentImages.length + newImages.length;
  if (totalImages < 1 || totalImages > 3) {
    setMessage(`You must have between 1 and 3 images. Currently selected: ${totalImages}`);
    setMessageType("error");
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  try {
    const formData = new FormData();
    formData.append("itemName", form.itemName);
    formData.append("smallIntro", form.smallIntro);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("availability", form.availability);

    // Append all remaining current images (not removed ones)
    currentImages.forEach((img) => {
      formData.append("existingImages", img);
    });

    // Append new image files (if any)
    newImages.forEach((imgObj) => {
      formData.append("images", imgObj.file);
    });

    // Debug log to check what we are actually sending
    console.log("Submitting update with:");
    console.log("- Current images:", currentImages.length);
    console.log("- New images:", newImages.length);
    console.log("- Total images:", totalImages);

    const res = await fetch(`http://localhost:5000/api/accessories/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setMessage("Accessory updated successfully!");
      setMessageType("success");
      setTimeout(() => navigate("/acctable"), 1500);
    } else {
      const errorData = await res.json();
      console.error("Update failed:", errorData);
      setMessage(`Failed to update: ${errorData.message || 'Unknown error'}`);
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
    }
  } catch (err) {
    console.error("Error updating accessory:", err);
    setMessage("Cannot connect to server. Please ensure the backend is running.");
    setMessageType("error");
    setTimeout(() => setMessage(""), 4000);
  }
};


  if (loading) {
    return (
      <div className="CH-update-loading-container">
        <div className="CH-loading-spinner"></div>
        <p className="CH-loading-text">Loading accessory...</p>
      </div>
    );
  }

  return (
    <div className="CH-update-accessory-wrapper">
      <div className="CH-update-accessory-container">
        {message && (
          <div className={`CH-update-message ${messageType}`}>
            {messageType === "success" && <span className="CH-message-icon">✓</span>}
            {messageType === "error" && <span className="CH-message-icon">✗</span>}
            {message}
          </div>
        )}

        <div className="CH-update-header">
          <h2 className="CH-update-title">Update Accessory</h2>
          <p className="CH-update-subtitle">Modify your accessory details and images</p>
        </div>

        <form onSubmit={handleSubmit} className="CH-update-form">
          <div className="CH-update-form-group">
            <label className="CH-update-label">
              <span className="CH-label-icon">📦</span>
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              className="CH-update-input"
              required
            />
          </div>

          <div className="CH-update-form-group">
            <label className="CH-update-label">
              <span className="CH-label-icon">📝</span>
              Small Intro
            </label>
            <input
              type="text"
              name="smallIntro"
              value={form.smallIntro}
              onChange={handleChange}
              placeholder="Brief introduction"
              className="CH-update-input"
              required
            />
          </div>

          <div className="CH-update-form-group">
            <label className="CH-update-label">
              <span className="CH-label-icon">📄</span>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description"
              className="CH-update-textarea"
              rows="5"
              required
            />
          </div>

          <div className="CH-update-form-row">
            <div className="CH-update-form-group">
              <label className="CH-update-label">
                <span className="CH-label-icon">💰</span>
                Price
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="CH-update-input"
                required
              />
            </div>

            <div className="CH-update-form-group">
              <label className="CH-update-label">
                <span className="CH-label-icon">📊</span>
                Availability
              </label>
              <select
                name="availability"
                value={form.availability}
                onChange={handleChange}
                className="CH-update-select"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="CH-update-form-group">
            <label className="CH-update-label">
              <span className="CH-label-icon">🖼️</span>
              Images (1-3 required)
              <span className="CH-image-count-badge">
                {currentImages.length + newImages.length} / 3
              </span>
            </label>

            <div className="CH-update-image-grid">
              {/* Current images */}
              {currentImages.map((img, index) => (
                <div key={`current-${index}`} className="CH-update-image-box">
                  <img
                    src={img}
                    alt={`Current ${index}`}
                    className="CH-update-image"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, "current")}
                    className="CH-update-remove-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <span className="CH-image-badge">Current</span>
                </div>
              ))}

              {/* New image previews */}
              {newImages.map((imgObj, index) => (
                <div key={`new-${index}`} className="CH-update-image-box">
                  <img
                    src={imgObj.preview}
                    alt={`New ${index}`}
                    className="CH-update-image"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, "new")}
                    className="CH-update-remove-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <span className="CH-image-badge new">New</span>
                </div>
              ))}
            </div>

            {/* File input to add new images */}
            {currentImages.length + newImages.length < 3 && (
              <div className="CH-update-file-input-wrapper">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="CH-update-file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="CH-update-file-label">
                  <span className="CH-file-icon">📁</span>
                  Choose Images
                </label>
                <p className="CH-file-hint">
                  Add {3 - (currentImages.length + newImages.length)} more image(s)
                </p>
              </div>
            )}
          </div>

          <div className="CH-update-actions">
            <button
              type="button"
              onClick={() => navigate("/acctable")}
              className="CH-update-btn-cancel"
            >
              <span className="CH-btn-icon">←</span> Cancel
            </button>
            <button type="submit" className="CH-update-btn-submit">
              <span className="CH-btn-icon">✓</span> Update Accessory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAccessory;
