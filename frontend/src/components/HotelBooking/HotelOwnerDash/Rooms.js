import React, { useState, useEffect } from "react";
import "./Rooms.css";


const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: "",
    roomType: "",
    roomNumber: "",
    bedType: "",
    roomsAvailable: "",
    maxOccupancy: "",
    pricePerNight: "",
    photos: null,
    description: "",
    view: "",
    size: "",
    extraBedAvailable: false,
    amenities: {
      parking: false,
      airportShuttle: false,
      restaurant: false,
      swimmingPool: false,
      bar: false,
      banquetFacilities: false,
      laundry: false,
      wifi: false,
      tv: false,
      airConditioning: false,
      minibar: false,
      bathtub: false,
      balcony: false
    }
  });

  // Fetch rooms from backend API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/rooms");
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data.rooms || data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotels for dropdown
  const fetchHotels = async () => {
    try {
      const response = await fetch("http://localhost:5000/hotels");
      if (!response.ok) throw new Error("Failed to fetch hotels");
      const data = await response.json();
      setHotels(data.hotels || data);
    } catch (err) {
      console.error("Error fetching hotels:", err);
    }
  };

  // Delete room
  const deleteRoom = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/rooms/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete room");
      setRooms(rooms.filter((room) => room._id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting room:", err);
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("amenities.")) {
      const amenityName = name.split(".")[1];
      setFormData({
        ...formData,
        amenities: {
          ...formData.amenities,
          [amenityName]: checked
        }
      });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    

    try {
      const formPayload = new FormData();
      formPayload.append("hotelId", formData.hotelId);
      formPayload.append("roomType", formData.roomType);
      formPayload.append("roomNumber", formData.roomNumber);
      formPayload.append("bedType", formData.bedType);
      formPayload.append("roomsAvailable", formData.roomsAvailable);
      formPayload.append("maxOccupancy", formData.maxOccupancy);
      formPayload.append("pricePerNight", formData.pricePerNight);
      formPayload.append("description", formData.description);
      formPayload.append("view", formData.view);
      formPayload.append("size", formData.size);
      formPayload.append("extraBedAvailable", formData.extraBedAvailable);
      formPayload.append("amenities", JSON.stringify(formData.amenities));

      // Photos
      if (formData.photos) {
        for (let i = 0; i < formData.photos.length; i++) {
          formPayload.append("photos", formData.photos[i]);
        }
      }

      const method = editingRoom ? "PUT" : "POST";
      const url = editingRoom
        ? `http://localhost:5000/rooms/${editingRoom._id}`
        : "http://localhost:5000/rooms";

      const response = await fetch(url, {
        method,
        body: formPayload,
      });

      if (!response.ok) throw new Error("Failed to save room");

      const savedRoom = await response.json();
      if (editingRoom) {
        setRooms(rooms.map((r) => (r._id === editingRoom._id ? savedRoom.room : r)));
      } else {
        setRooms([...rooms, savedRoom.room]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      hotelId: "",
      roomType: "",
      roomNumber: "",
      bedType: "",
      roomsAvailable: "",
      maxOccupancy: "",
      pricePerNight: "",
      photos: null,
      description: "",
      view: "",
      size: "",
      extraBedAvailable: false,
      amenities: {
        parking: false,
        airportShuttle: false,
        restaurant: false,
        swimmingPool: false,
        bar: false,
        banquetFacilities: false,
        laundry: false,
        wifi: false,
        tv: false,
        airConditioning: false,
        minibar: false,
        bathtub: false,
        balcony: false
      }
    });
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleEdit = (room) => {
    setFormData({
      hotelId: room.hotelId?._id || room.hotelId || "",
      roomType: room.roomType || "",
      roomNumber: room.roomNumber || "",
      bedType: room.bedType || "",
      roomsAvailable: room.roomsAvailable || "",
      maxOccupancy: room.maxOccupancy || "",
      pricePerNight: room.pricePerNight || "",
      photos: null,
      description: room.description || "",
      view: room.view || "",
      size: room.size || "",
      extraBedAvailable: room.extraBedAvailable || false,
      amenities: room.amenities || {
        parking: false,
        airportShuttle: false,
        restaurant: false,
        swimmingPool: false,
        bar: false,
        banquetFacilities: false,
        laundry: false,
        wifi: false,
        tv: false,
        airConditioning: false,
        minibar: false,
        bathtub: false,
        balcony: false
      }
    });
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      await deleteRoom(id);
    }
  };

  const getActiveAmenities = (amenities) => {
    if (!amenities) return [];
    return Object.entries(amenities)
      .filter(([_, value]) => value)
      .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  };

  if (loading)
    return (
      <div className="page">
        <h1>Rooms Management</h1>
        <div className="loading">Loading rooms...</div>
      </div>
    );
  if (error)
    return (
      <div className="page">
        <h1>Rooms Management</h1>
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchRooms} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="page">
      
      <h1>Rooms Management</h1>

      <div className="top-actions">
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Room"}
        </button>
        <button onClick={fetchRooms} className="btn-refresh">
          Refresh
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Hotel:</label>
                <select
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Room Type:</label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select room type</option>
                  <option value="Double Room with Lake View">Double Room with Lake View</option>
                  <option value="Deluxe Triple Room">Deluxe Triple Room</option>
                  <option value="Standard Room">Standard Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Family Room">Family Room</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Room Number:</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 101"
                />
              </div>

              <div className="form-group">
                <label>Bed Type:</label>
                <input
                  type="text"
                  name="bedType"
                  value={formData.bedType}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., King, Queen, Twin"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rooms Available:</label>
                <input
                  type="number"
                  name="roomsAvailable"
                  value={formData.roomsAvailable}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Max Occupancy:</label>
                <input
                  type="number"
                  name="maxOccupancy"
                  value={formData.maxOccupancy}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price Per Night (Rs):</label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>View:</label>
                <select
                  name="view"
                  value={formData.view}
                  onChange={handleInputChange}
                >
                  <option value="">Select view</option>
                  <option value="Lake View">Lake View</option>
                  <option value="Garden View">Garden View</option>
                  <option value="Pool View">Pool View</option>
                  <option value="Mountain View">Mountain View</option>
                  <option value="City View">City View</option>
                  <option value="No View">No View</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Size (sq meters):</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Photos:</label>
                <input
                  type="file"
                  name="photos"
                  onChange={(e) =>
                    setFormData({ ...formData, photos: e.target.files })
                  }
                  multiple
                  accept="image/*"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Room description and features..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="extraBedAvailable"
                  checked={formData.extraBedAvailable}
                  onChange={handleInputChange}
                />
                Extra Bed Available
              </label>
            </div>

            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {Object.keys(formData.amenities).map((amenity) => (
                  <label key={amenity} className="amenity-checkbox">
                    <input
                      type="checkbox"
                      name={`amenities.${amenity}`}
                      checked={formData.amenities[amenity]}
                      onChange={handleInputChange}
                    />
                    {amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingRoom ? "Update" : "Add"} Room
              </button>
              <button type="button" onClick={resetForm} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rooms-section">
        <h2>Available Rooms ({rooms.length})</h2>
        {rooms.length === 0 ? (
          <p className="no-rooms">No rooms found in the database.</p>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div key={room._id} className="room-card">
                <div className="room-card-header">
                  <div className="room-number-badge">Room {room.roomNumber}</div>
                  <div className="room-price">Rs{room.pricePerNight}<span>/night</span></div>
                </div>

                {room.photos && room.photos.length > 0 && (
                  <div className="room-image">
                    <img src={`http://localhost:5000/${room.photos[0]}`} alt={room.roomType} />
                  </div>
                )}

                <div className="room-card-body">
                  <h3 className="room-type">{room.roomType}</h3>
                  <p className="room-hotel">{room.hotelId?.name || "N/A"}</p>
                  
                  <div className="room-details">
                    <div className="detail-item">
                      <span className="detail-label">Bed Type:</span>
                      <span className="detail-value">{room.bedType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Max Occupancy:</span>
                      <span className="detail-value">{room.maxOccupancy} guests</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Available:</span>
                      <span className="detail-value">{room.roomsAvailable} rooms</span>
                    </div>
                    {room.view && (
                      <div className="detail-item">
                        <span className="detail-label">View:</span>
                        <span className="detail-value">{room.view}</span>
                      </div>
                    )}
                    {room.size && (
                      <div className="detail-item">
                        <span className="detail-label">Size:</span>
                        <span className="detail-value">{room.size} m²</span>
                      </div>
                    )}
                  </div>

                  {room.description && (
                    <p className="room-description">{room.description}</p>
                  )}

                  {getActiveAmenities(room.amenities).length > 0 && (
                    <div className="room-amenities">
                      <strong>Amenities:</strong>
                      <div className="amenity-tags">
                        {getActiveAmenities(room.amenities).map((amenity, index) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {room.extraBedAvailable && (
                    <div className="extra-bed-badge">Extra Bed Available</div>
                  )}
                </div>

                <div className="room-card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(room)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(room._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;