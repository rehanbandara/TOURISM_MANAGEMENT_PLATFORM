import React, { useEffect, useState } from "react";
import "../../unified-styles.css";

const AccessoryTable = () => {
  const [getAllAccessories1, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all accessories from backend
  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/accessories/all");
        const data = await res.json();
        console.log("Fetched Accessories:", data);
        setAccessories(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error fetching accessories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessories();
  }, []);

  // Delete Accessory
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this accessory?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/accessories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAccessories(getAllAccessories1.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error("Error deleting accessory:", err);
    }
  };

  // Update - redirect to update page
  const handleUpdate = (id) => {
    window.location.href = `/update/${id}`;
  };

  if (loading) {
    return (
      <div className="CH-table-loading-container">
        <div className="CH-loading-spinner"></div>
        <p className="CH-loading-text">Loading accessories...</p>
      </div>
    );
  }

  return (
    <div className="CH-table-wrapper">
      <div className="CH-table-container">
        <div className="CH-table-header">
          <h2 className="CH-table-title">Accessory Management</h2>
          <p className="CH-table-subtitle">Manage your accessory inventory</p>
        </div>

        <div className="CH-table-content">
          <table className="CH-table-modern">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Small Intro</th>
                <th>Description</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Image 1</th>
                <th>Image 2</th>
                <th>Image 3</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getAllAccessories1.length === 0 ? (
                <tr>
                  <td colSpan="9" className="CH-table-empty">
                    <div className="CH-empty-state">
                      <span className="CH-empty-icon">📦</span>
                      <p>No accessories found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                getAllAccessories1.map((item) => (
                  <tr key={item._id}>
                    <td className="CH-table-name">{item.itemName}</td>
                    <td className="CH-table-intro">{item.smallIntro}</td>
                    <td className="CH-table-desc">{item.description}</td>
                    <td className="CH-table-price">${item.price}</td>
                    <td>
                      <span className={`CH-availability-badge ${item.availability === "In Stock" ? "in-stock" : "out-of-stock"}`}>
                        {item.availability}
                      </span>
                    </td>
                    {[0, 1, 2].map((index) => (
                      <td key={index} className="CH-table-image-cell">
                        {item.imagePaths[index] ? (
                          <img
                            src={item.imagePaths[index]}
                            alt={`Accessory ${index + 1}`}
                            className="CH-table-image"
                          />
                        ) : (
                          <span className="CH-image-na">N/A</span>
                        )}
                      </td>
                    ))}
                    <td className="CH-table-actions">
                      <button className="CH-table-btn-update" onClick={() => handleUpdate(item._id)}>
                         Update
                      </button>
                      <button className="CH-table-btn-delete" onClick={() => handleDelete(item._id)}>
                         Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {getAllAccessories1.length > 0 && (
          <div className="CH-table-footer">
            <p className="CH-table-count">
              Showing <strong>{getAllAccessories1.length}</strong> {getAllAccessories1.length === 1 ? 'accessory' : 'accessories'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoryTable;
