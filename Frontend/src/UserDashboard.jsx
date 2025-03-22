import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaShoppingCart } from 'react-icons/fa';
import { IoLogOutSharp } from "react-icons/io5";
import { FaBars } from 'react-icons/fa';
import profilePic from '../src/assets/priya-singh.jpg'
import UserProfile from '../src/components/UserProfile/UserProfile';
import './UserDashboard.css';
import UserOrders from './components/UserOrders/UserOrders';
import UserCart from './components/UserCart/UserCart';
// import UserChat from './UserChat/UserChat';
import { IoMdChatbubbles } from "react-icons/io";
import { useAuth0 } from '@auth0/auth0-react';

const UserDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname.includes(path) ? 'active' : '';
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    setUserRole(null);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Menu Button */}
      <div className="mobile-menu-button" onClick={toggleSidebar}>
        <FaBars />
      </div>

      {/* Fixed Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="profile-pic-section">
          <img src={profilePic} alt="Profile" className="profile-pic" />
        </div>
        <ul className="sidebar-menu">
          <li 
            className={isActive('/user/profile')}
            onClick={() => handleMenuClick('/user/profile')}
          >
            <FaUser className="icon" /> Profile Information
          </li>
          <li 
            className={isActive('/user/orders')}
            onClick={() => handleMenuClick('/user/orders')}
          >
            <FaShoppingBag className="icon" /> My Orders
          </li>
          <li 
            className={isActive('/user/cart')}
            onClick={() => handleMenuClick('/user/cart')}
          >
            <FaShoppingCart className="icon" /> Cart
          </li>
          <li 
            className={isActive('/user/messages')}
            onClick={() => handleMenuClick('/user/messages')}
          >
            <IoMdChatbubbles className="icon" /> Messages
          </li>
          <li onClick={handleLogout}>
            <IoLogOutSharp className="icon" /> Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="/user/profile" replace />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/cart" element={<UserCart />} />
          {/* <Route path="/messages" element={<UserChat />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;