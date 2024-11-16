import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <h1>FINGERPRINT ATM SYSTEM</h1>
      <div className="nav-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Navbar;
