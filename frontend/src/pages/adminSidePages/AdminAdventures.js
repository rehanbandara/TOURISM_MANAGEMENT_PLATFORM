import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAdventures.css';

const AdminAdventures = () => {
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: '',
    price: '',
    duration: '',
    difficulty: '',
    groupSize: '',
    rating: '',
    images: []
  });

  //handling images
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    fetchAdventures();
  }, []);

  const fetchAdventures = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/activities');
      setAdventures(response.data.data || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching adventures:', err);
      setError('Failed to load adventures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedAdventure(null);
    setFormData({
      name: '',
      category: '',
      location: '',
      description: '',
      price: '',
      duration: '',
      difficulty: '',
      groupSize: '',
      rating: '',
      images: []
    });
    setSelectedImages([]);
    setImagePreview([]);
    setShowModal(true);
  };

  const handleEdit = (adventure) => {
    setModalMode('edit');
    setSelectedAdventure(adventure);
    setFormData({
      name: adventure.title || adventure.name,
      category: adventure.category || '',
      location: adventure.location,
      description: adventure.description || '',
      price: adventure.price?.toString() || '',
      duration: adventure.durationHours?.toString() || adventure.duration || '',
      difficulty: adventure.difficulty || '',
      groupSize: adventure.groupSize?.toString() || '',
      rating: adventure.rating?.toString() || '',
      images: adventure.images || []
    });
    setSelectedImages([]);
    setImagePreview(adventure.images || []);
    setShowModal(true);
  };

  const handleView = (adventure) => {
    setModalMode('view');
    setSelectedAdventure(adventure);
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:5000/api/activities/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
          }
        });
        fetchAdventures(); // Refresh the list
        alert('Adventure deleted successfully!');
      } catch (err) {
        console.error('Error deleting adventure:', err);
        alert('Failed to delete adventure. You may need admin permissions.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      
      // Add form data
      submitData.append('title', formData.name);
      submitData.append('category', formData.category || 'Adventure');
      submitData.append('location', formData.location);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price ? parseFloat(formData.price) : 0);
      submitData.append('durationHours', formData.duration ? parseFloat(formData.duration) : 1);
      submitData.append('difficulty', formData.difficulty);
      // Note: groupSize and rating are not in the backend model, so we skip them
      
      // Add images
      selectedImages.forEach((image, index) => {
        submitData.append('images', image);
      });

      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/activities', submitData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // Note: Don't set Content-Type for FormData - axios sets it automatically with boundary
          }
        });
        alert('Adventure created successfully!');
      } else if (modalMode === 'edit') {
        await axios.put(`http://localhost:5000/api/activities/${selectedAdventure._id}`, submitData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // Note: Don't set Content-Type for FormData - axios sets it automatically with boundary
          }
        });
        alert('Adventure updated successfully!');
      }

      // Reset form after successful submission
      setFormData({
        name: '',
        category: '',
        location: '',
        description: '',
        price: '',
        duration: '',
        difficulty: '',
        groupSize: '',
        rating: ''
      });
      setSelectedImages([]);
      setImagePreview([]);
      
      closeModal();
      fetchAdventures();
    } catch (err) {
      console.error('Error saving adventure:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 409) {
        alert('An adventure with this title and location already exists.');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || 'Invalid data provided. Please check all required fields.';
        alert(errorMsg);
      } else if (err.response?.status === 500) {
        const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Server error occurred';
        alert(`Server error: ${errorMsg}`);
        console.error('Full error details:', err.response?.data);
      } else {
        alert('Failed to save adventure. Please check your data and try again.');
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

  const closeModal = () => {
    setShowModal(false);
    // Reset form data
    setFormData({
      name: '',
      category: '',
      location: '',
      description: '',
      price: '',
      duration: '',
      difficulty: '',
      groupSize: '',
      rating: ''
    });
    setSelectedImages([]);
    setImagePreview([]);
    setSelectedAdventure(null);
  };

  const filteredAdventures = adventures.filter(adventure =>
    adventure.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adventure.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adventure.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAdventures = [...filteredAdventures].sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading adventures...</p>
      </div>
    );
  }

  return (
    <div className="admin-adventures">
      <div className="admin-header">
        <div className="header-content">
          <h1>Adventures Management</h1>
          <p>Manage all adventure activities in your system</p>
        </div>
        <button className="create-btn" onClick={handleCreate}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Add New Adventure
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
              placeholder="Search adventures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="sort-section">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="difficulty">Difficulty</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
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

      <div className="adventures-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Location</th>
              <th>Difficulty</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAdventures.map((adventure) => (
              <tr key={adventure._id}>
                <td>
                  <div className="adventure-image">
                    <img 
                      src={adventure.images?.[0] || 'https://via.placeholder.com/60x40/1e3c72/ffffff?text=No+Image'} 
                      alt={adventure.name}
                      loading="lazy"
                    />
                  </div>
                </td>
                <td>
                  <div className="adventure-name">
                    <strong>{adventure.name}</strong>
                  </div>
                </td>
                <td>{adventure.location}</td>
                <td>
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(adventure.difficulty) }}
                  >
                    {adventure.difficulty || 'Not Set'}
                  </span>
                </td>
                <td>
                  <span className="price-display">
                    LKR:{adventure.price || 0}
                  </span>
                </td>
                <td>{adventure.duration || 'Not specified'}</td>
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
                  <div className="action-buttons">
                    <button 
                      className="view-button" 
                      onClick={() => handleView(adventure)}
                      title="View Details"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </button>
                    <button 
                      className="edit-button" 
                      onClick={() => handleEdit(adventure)}
                      title="Edit"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L10.5 8.207l-3 3L1.707 17a1 1 0 0 1-1.414-1.414L6.086 9.793l3-3L12.146.146zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDelete(adventure._id, adventure.name)}
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

        {sortedAdventures.length === 0 && (
          <div className="no-data">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            <h3>No adventures found</h3>
            <p>Get started by adding your first adventure</p>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit/View */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Add New Adventure'}
                {modalMode === 'edit' && 'Edit Adventure'}
                {modalMode === 'view' && 'Adventure Details'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {modalMode === 'view' ? (
                <div className="adventure-details">
                  <div className="detail-row">
                    <label>Name:</label>
                    <span>{selectedAdventure?.name}</span>
                  </div>
                  <div className="detail-row">
                    <label>Location:</label>
                    <span>{selectedAdventure?.location}</span>
                  </div>
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{selectedAdventure?.description || 'No description available'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Price:</label>
                    <span>${selectedAdventure?.price || 0}</span>
                  </div>
                  <div className="detail-row">
                    <label>Duration:</label>
                    <span>{selectedAdventure?.duration || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Difficulty:</label>
                    <span>{selectedAdventure?.difficulty || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Group Size:</label>
                    <span>{selectedAdventure?.groupSize || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <label>Rating:</label>
                    <span>{selectedAdventure?.rating || 0}/5</span>
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
                        placeholder="Enter adventure name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Water Sports">Water Sports</option>
                        <option value="Mountain">Mountain</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="Extreme Sports">Extreme Sports</option>
                      </select>
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
                      <label htmlFor="price">Price ($)</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="duration">Duration</label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        placeholder="e.g., 3 days, 2 hours"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="difficulty">Difficulty</label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                      >
                        <option value="">Select difficulty</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="groupSize">Group Size</label>
                      <input
                        type="number"
                        id="groupSize"
                        name="groupSize"
                        value={formData.groupSize}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="Max group size"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="images">Adventure Images</label>
                      <input
                        type="file"
                        id="images"
                        name="images"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="file-input"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="images" className="file-input-label">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path>
                          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093L6.586 9.5 2.002 8V3a1 1 0 0 1 1-1h12z"></path>
                        </svg>
                        Choose Images
                      </label>
                      <div className="image-preview-grid">
                        {imagePreview.map((image, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={image} alt={`Preview ${index}`} />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="remove-image-btn"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Enter adventure description"
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {modalMode === 'create' ? 'Create Adventure' : 'Update Adventure'}
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

export default AdminAdventures;