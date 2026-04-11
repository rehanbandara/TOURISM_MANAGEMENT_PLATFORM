import React from 'react';
import './Dashboard.css';
import Navbar from './Navbar';

const Dashboard = () => {
  return (
    <div className="MA-dashboard">
      <Navbar />  
      <h1>Hotel Owner Dashboard</h1>
      
      <div className="MA-stats-grid">
        <div className="MA-stat-card">
          <h3>Total Hotels</h3>
          <div className="number">5</div>
        </div>
        
        <div className="MA-stat-card">
          <h3>Total Rooms</h3>
          <div className="number">42</div>
        </div>
        
        <div className="MA-stat-card">
          <h3>Active Bookings</h3>
          <div className="number">18</div>
        </div>
        
        <div className="MA-stat-card">
          <h3>Average Rating</h3>
          <div className="number">4.2</div>
        </div>
      </div>
      
      <div className="MA-card">
        <h2>Recent Activity</h2>
        <p>Welcome to your hotel management dashboard. Here you can manage your hotels, rooms, bookings, and reviews.</p>
        <p>Use the navigation menu above to access different sections of your dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;