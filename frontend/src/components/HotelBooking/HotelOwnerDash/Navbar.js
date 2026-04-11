import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link 
            to="/dashboard" 
            className={location.pathname === '/dashboard' ? 'nav-link active' : 'nav-link'}
          >
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/hotelsdash" 
            className={location.pathname === '/hotelsdash' ? 'nav-link active' : 'nav-link'}
          >
            Hotels
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/roomsdash" 
            className={location.pathname === '/roomsdash' ? 'nav-link active' : 'nav-link'}
          >
            Rooms
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/bookingsdash" 
            className={location.pathname === '/bookingsdash' ? 'nav-link active' : 'nav-link'}
          >
            Bookings
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/photodash" 
            className={location.pathname === '/photodash' ? 'nav-link active' : 'nav-link'}
          >
            Photo Gallery
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;