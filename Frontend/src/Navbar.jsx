import React, { useState } from 'react';
import { FaBell, FaComment, FaBars, FaLeaf, FaSearch } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <FaLeaf className="logo-icon" /> FarmTrust
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="hamburger" onClick={toggleDrawer}>
        <FaBars />
      </div>

      {/* Navbar Items */}
      <div className={`navbar-items ${isDrawerOpen ? 'open' : ''}`}>
        {/* Search Bar */}
        <div className="navbar-search">
          <input type="text" placeholder="Search products..." />
          <FaSearch className="search-icon" />
        </div>

        {/* Icons */}
        <div className="navbar-icons">
          <div className="icon-wrapper">
            <FaBell />
            <span className="badge">3</span>
          </div>
          <div className="icon-wrapper">
            <FaComment />
            <span className="badge">2</span>
          </div>
        </div>

        {/* Sign In Button */}
        <button className="sign-in-btn">Sign In</button>
      </div>
    </nav>
  );
};

export default Navbar;