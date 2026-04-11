import React, { useState } from "react";
import "../../unified-styles.css";

const CHProfile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to update user profile
    console.log("Saving profile:", profileData);
    setIsEditing(false);
    // Add API call here later
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
    setProfileData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      address: user?.address || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
    });
  };

  return (
    <div className="CH-profile-container">
      <div className="CH-profile-header">
        <div className="CH-profile-avatar">
          {user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="CH-profile-header-info">
          <h2>{user?.username || "User"}</h2>
          <p className="CH-profile-role">{user?.type || "User"}</p>
        </div>
      </div>

      <div className="CH-profile-content">
        <div className="CH-profile-section">
          <div className="CH-profile-section-header">
            <h3>Personal Information</h3>
            {!isEditing ? (
              <button
                className="CH-profile-edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="CH-profile-action-buttons">
                <button className="CH-profile-save-btn" onClick={handleSave}>
                  Save
                </button>
                <button className="CH-profile-cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="CH-profile-form">
            <div className="CH-profile-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              />
            </div>

            <div className="CH-profile-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              />
            </div>

            <div className="CH-profile-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              />
            </div>

            <div className="CH-profile-field">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              />
            </div>

            <div className="CH-profile-field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={profileData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              />
            </div>

            <div className="CH-profile-field">
              <label>Gender</label>
              <select
                name="gender"
                value={profileData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className="CH-profile-input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="CH-profile-section">
          <h3>Account Statistics</h3>
          <div className="CH-profile-stats">
            <div className="CH-profile-stat-card">
              <div className="CH-profile-stat-icon">📅</div>
              <div className="CH-profile-stat-info">
                <h4>Member Since</h4>
                <p>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="CH-profile-stat-card">
              <div className="CH-profile-stat-icon">🔐</div>
              <div className="CH-profile-stat-info">
                <h4>Last Login</h4>
                <p>{new Date(user?.lastLogin || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="CH-profile-stat-card">
              <div className="CH-profile-stat-icon">✅</div>
              <div className="CH-profile-stat-info">
                <h4>Account Status</h4>
                <p className="CH-profile-status-active">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CHProfile;

