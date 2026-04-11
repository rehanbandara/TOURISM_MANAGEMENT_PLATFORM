import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDestinations.css';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    entryFee: '',
    bestTimeToVisit: '',
    activities: '',
    rating: '',
    images: []
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/destinations');
      setDestinations(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedDestination(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      entryFee: '',
      bestTimeToVisit: '',
      activities: '',
      rating: '',
      images: []
    });
    setSelectedImages([]);
    setImagePreview([]);
    setShowModal(true);
  };

  const handleEdit = (destination) => {
    setModalMode('edit');
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      location: destination.location,
      description: destination.description || '',
      entryFee: destination.entryFee?.toString() || '',
      bestTimeToVisit: destination.bestTimeToVisit || '',
      activities: Array.isArray(destination.activities) 
        ? destination.activities.join(', ') 
        : destination.activities || '',
      images: destination.images || []
    });
    setSelectedImages([]);
    setImagePreview(destination.images || []);
    setShowModal(true);
  };

  const handleView = (destination) => {
    setModalMode('view');
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/destinations/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
          }
        });
        fetchDestinations(); // Refresh the list
        alert('Destination deleted successfully!');
      } catch (err) {
        console.error('Error deleting destination:', err);
        alert('Failed to delete destination. You may need admin permissions.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Add form data
      submitData.append('name', formData.name);
      submitData.append('location', formData.location);
      submitData.append('description', formData.description);
      submitData.append('entryFee', formData.entryFee ? parseFloat(formData.entryFee) : 0);
      submitData.append('bestTimeToVisit', formData.bestTimeToVisit);
      
      // Add activities as comma-separated string
      const activities = formData.activities 
        ? formData.activities.split(',').map(activity => activity.trim()).join(',')
        : '';
      submitData.append('activities', activities);
      
      // Add images
      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/destinations', submitData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // Note: Don't set Content-Type for FormData - axios sets it automatically with boundary
          }
        });
        alert('Destination created successfully!');
      } else if (modalMode === 'edit') {
        await axios.put(`http://localhost:5000/api/destinations/${selectedDestination._id}`, submitData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // Note: Don't set Content-Type for FormData - axios sets it automatically with boundary
          }
        });
        alert('Destination updated successfully!');
      }

      setShowModal(false);
      fetchDestinations();
    } catch (err) {
      console.error('Error saving destination:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 409) {
        alert('A destination with this name and location already exists. Please use a different name or location.');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Invalid data provided. Please check all required fields.';
        alert(errorMsg);
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Server error occurred';
        alert(`Server error: ${errorMsg}`);
        console.error('Full error details:', err.response?.data);
      } else {
        alert('Failed to save destination. Please check your data and try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const filteredDestinations = destinations.filter(destination =>
    destination.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDestinations = [...filteredDestinations].sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading destinations...</p>
      </div>
    );
  }

  return (
    <div className="admin-destinations">
      <div className="admin-header">
        <div className="header-content">
          <h1>Destinations Management</h1>
          <p>Manage all tourist destinations in your system</p>
        </div>
        <button className="create-btn" onClick={handleCreate}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add New Destination
        </button>
      </div>

      <div className="admin-controls">
        <div className="search-section">
          <div className="search-box">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="sort-section">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="rating">Rating</option>
            <option value="entryFee">Entry Fee</option>
            <option value="createdAt">Created Date</option>
          </select>
          <button 
            className={`sort-order ${sortOrder}`}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              {sortOrder === 'asc' ? (
                <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
              ) : (
                <path d="M3.5 13.5a.5.5 0 0 1-1 0V4.707L1.354 5.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.497.497 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L3.5 4.707V13.5zm3.5-9a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          {error}
        </div>
      )}

      <div className="destinations-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Location</th>
              <th>Rating</th>
              <th>Entry Fee</th>
              <th>Activities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDestinations.map((destination) => (
              <tr key={destination._id}>
                <td>
                  <div className="destination-image">
                    <img 
                      src={destination.images?.[0] || 'https://via.placeholder.com/60x40/1e3c72/ffffff?text=No+Image'} 
                      alt={destination.name}
                      loading="lazy"
                    />
                  </div>
                </td>
                <td>
                  <div className="destination-name">
                    <strong>{destination.name}</strong>
                  </div>
                </td>
                <td>{destination.location}</td>
                <td>
                  <div className="rating-display">
                    <span className="rating-stars">
                      {'★'.repeat(4)}
                      {'☆'.repeat(1)}
                    </span>
                    <span className="rating-number">(4)</span>
                  </div>
                </td>
                <td>
                  <span className="entry-fee">
                    {destination.entryFee === 0 ? 'Free' : `$${destination.entryFee}`}
                  </span>
                </td>
                <td>
                  <div className="activities-list">
                    {(() => {
                      let activitiesArray = destination.activities;
                      
                      // Handle case where activities might be a string
                      if (typeof activitiesArray === 'string') {
                        activitiesArray = activitiesArray.split(',').map(activity => activity.trim()).filter(activity => activity);
                      }
                      
                      // Ensure it's an array
                      if (!Array.isArray(activitiesArray)) {
                        activitiesArray = [];
                      }
                      
                      // Filter out empty strings
                      activitiesArray = activitiesArray.filter(activity => activity && activity.trim());
                      
                      if (activitiesArray.length === 0) {
                        return <span className="no-activities">None</span>;
                      }
                      
                      return (
                        <>
                          {activitiesArray.slice(0, 2).map((activity, index) => (
                            <span key={index} className="activity-tag">{activity}</span>
                          ))}
                          {activitiesArray.length > 2 && (
                            <span className="activity-more">+{activitiesArray.length - 2} more</span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-button" 
                      onClick={() => handleView(destination)}
                      title="View Details"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </button>
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(destination)}
                      title="Edit"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L10.5 8.207l-3 3L1.707 17a1 1 0 0 1-1.414-1.414L6.086 9.793l3-3L12.146.146zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDelete(destination._id, destination.name)}
                      title="Delete"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedDestinations.length === 0 && (
          <div className="no-data">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <h3>No destinations found</h3>
            <p>Get started by adding your first destination</p>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Add New Destination'}
                {modalMode === 'edit' && 'Edit Destination'}
                {modalMode === 'view' && 'Destination Details'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {modalMode === 'view' ? (
                <div className="destination-details">
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{selectedDestination?.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Location:</label>
                    <span>{selectedDestination?.location}</span>
                  </div>
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{selectedDestination?.description || 'No description available'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Entry Fee:</label>
                    <span>{selectedDestination?.entryFee === 0 ? 'Free' : `LKR:${selectedDestination?.entryFee}`}</span>
                  </div>
                  <div className="detail-row">
                    <label>Best Time to Visit:</label>
                    <span>{selectedDestination?.bestTimeToVisit || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Rating:</label>
                    <span>{selectedDestination?.rating || 0}/5</span>
                  </div>
                  <div className="detail-row">
                    <label>Activities:</label>
                    <span>
                      {(() => {
                        const activities = selectedDestination?.activities;
                        if (!activities || !Array.isArray(activities) || activities.length === 0) {
                          return 'None listed';
                        }
                        const validActivities = activities.filter(activity => activity && activity.trim());
                        return validActivities.length > 0 ? validActivities.join(', ') : 'None listed';
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter destination name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Location *</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter location"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="entryFee">Entry Fee ($)</label>
                      <input
                        type="number"
                        id="entryFee"
                        name="entryFee"
                        value={formData.entryFee}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter destination description"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bestTimeToVisit">Best Time to Visit</label>
                      <input
                        type="text"
                        id="bestTimeToVisit"
                        name="bestTimeToVisit"
                        value={formData.bestTimeToVisit}
                        onChange={handleInputChange}
                        placeholder="e.g., December to March"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="activities">Activities (comma-separated)</label>
                      <input
                        type="text"
                        id="activities"
                        name="activities"
                        value={formData.activities}
                        onChange={handleInputChange}
                        placeholder="e.g., Hiking, Photography, Sightseeing"
                      />
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="images">Upload Images</label>
                      <input
                        type="file"
                        id="images"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="images" className="file-input-label">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.586 9.5 2.002 8V3a1 1 0 0 1 1-1h12z"/>
                        </svg>
                        Choose Images
                      </label>
                      
                      {imagePreview.length > 0 && (
                        <div className="image-preview-container">
                          {imagePreview.map((preview, index) => (
                            <div key={index} className="image-preview">
                              <img src={preview} alt={`Preview ${index + 1}`} />
                              <button 
                                type="button" 
                                className="remove-image"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {modalMode === 'create' ? 'Create Destination' : 'Update Destination'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;