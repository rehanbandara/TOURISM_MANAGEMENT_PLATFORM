import React, { useState } from "react";
import axios from "axios";

import '../../unified-styles.css';

function AddAccessory() {
  const [itemName, setItemName] = useState("");
  const [smallIntro, setSmallIntro] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);

  const handleSingleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (images.length >= 3) {
      alert("You can only upload up to 3 images.");
      return;
    }

    setImages((prevImages) => [...prevImages, file]);
    e.target.value = null; // reset file input
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least 1 image.");
      return;
    }

    const formData = new FormData();
    formData.append("itemName", itemName);
    formData.append("smallIntro", smallIntro);
    formData.append("description", description);
    formData.append("price", price);

    images.forEach((img) => formData.append("images", img));

    try {
      const response = await axios.post("http://localhost:5000/api/accessories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.status === 201) {
        alert("Accessory Added Successfully!");

        // Reset form
        setItemName("");
        setSmallIntro("");
        setDescription("");
        setPrice("");
        setImages([]);
      }
    } catch (error) {
      console.error("Error adding accessory:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.error || error.response.data.message || 'Failed to add accessory'}`);
      } else if (error.request) {
        alert("Error: Cannot connect to server. Please make sure the backend is running.");
      } else {
        alert("Error adding accessory. Please try again.");
      }
    }
  };

  return (
    <div>
    
      <form onSubmit={handleSubmit} className="CH-add-accessory-form">
        <h2>Add New Accessory Item</h2>

        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Small Intro"
          value={smallIntro}
          onChange={(e) => setSmallIntro(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        {images.length < 3 && (
          <input
            type="file"
            accept="image/*"
            onChange={handleSingleImageUpload}
          />
        )}

        <div className="CH-image-preview">
          {images.map((img, index) => (
            <div key={index} className="CH-image-box">
              <img src={URL.createObjectURL(img)} alt={`preview-${index}`} />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="CH-remove-button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="submit">Add Accessory</button>
      </form>
    </div>
  );
}

export default AddAccessory;
