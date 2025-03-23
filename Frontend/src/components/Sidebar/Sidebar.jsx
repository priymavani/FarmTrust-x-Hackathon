import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { FaBox, FaShoppingCart, FaComments, FaChartBar, FaUser, FaTimes } from 'react-icons/fa';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaLeaf } from "react-icons/fa6";
import { Link, useLocation } from 'react-router-dom';
import { RiDashboardFill } from "react-icons/ri";
import { IoLogOutSharp } from "react-icons/io5";
import { useAuth0 } from '@auth0/auth0-react';

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const [activePath, setActivePath] = useState('/farmerpanel/dashboard');
  const { logout } = useAuth0();
  
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    setUserRole(null);
  };

  return (
    <>
      <div className={`da-sidebar ${sidebarOpen ? 'da-sidebar-open' : ''}`}>
        <div className="da-logo-container navbar-logo">
          <span className="da-logo-icon"> <FaLeaf className='leaf-logo'/></span>
          <h2 className="da-logo-text">FarmTrust</h2>
          <div className="da-close-sidebar" onClick={toggleSidebar}>
            <FaTimes />
          </div>
        </div>
        
        <nav className="da-sidebar-nav">
          <Link to='/'>
            <div className="da-nav-item" onClick={toggleSidebar}>
              <span className="da-nav-icon"><IoMdArrowRoundBack /></span>
              <span className="da-nav-text"> Home </span>
            </div>
          </Link>

          <Link to='/farmerpanel/dashboard'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/dashboard' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><RiDashboardFill /></span>
            <span className="da-nav-text">Dashboard</span>
          </div>
          </Link>

          <Link to='/farmerpanel/profile'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/profile' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><FaUser /></span>
            <span className="da-nav-text">Profile</span>
          </div>
          </Link>
          
          <Link to='/farmerpanel/products'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/products' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><FaBox /></span>
            <span className="da-nav-text">My Products</span>
          </div>
          </Link>
          
          <Link to='/farmerpanel/orders'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/orders' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><FaShoppingCart /></span>
            <span className="da-nav-text">Orders</span>
          </div>
          </Link>
          
          <Link to='/farmerpanel/messages'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/messages' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><FaComments /></span>
            <span className="da-nav-text">Messages</span>
          </div>
          </Link>
          
          <Link to='/farmerpanel/analytics'>
          <div className={`da-nav-item ${activePath === '/farmerpanel/analytics' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><FaChartBar /></span>
            <span className="da-nav-text">Analytics</span>
          </div>
          </Link>
          <Link to='/'>
          <div className={`da-nav-item ${activePath === '/' ? 'da-active' : ''}`} onClick={toggleSidebar}>
            <span className="da-nav-icon"><IoLogOutSharp /></span>
            <span className="da-nav-text" onClick={handleLogout}>Logout</span>
          </div>
          </Link>
          
        </nav>
      </div>
      
      {sidebarOpen && <div className="da-sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;