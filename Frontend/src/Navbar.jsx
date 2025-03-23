import React, { useState, useEffect } from 'react';
import { FaBell, FaComment, FaBars, FaLeaf, FaSearch } from 'react-icons/fa';
import './Navbar.css';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserByEmail } from './components/api';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithPopup, logout, isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0();
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const fetchUserRole = async () => {
    if (!isAuthenticated || !user?.email) return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const data = await getUserByEmail(user.email, token);
      sessionStorage.setItem('email', user.email);
      sessionStorage.setItem('role', data.user.role);
      setUserRole(data.user.role);
    } catch (err) {
      setError(err.message);
      setUserRole(sessionStorage.getItem('role') || 'customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [isAuthenticated, user]);

  const handleProfileClick = () => {
    if (loading) return;
    if (userRole === 'farmer') {
      navigate('/farmerpanel/dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (userRole === 'customer') {
      navigate('/user/profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignIn = async () => {
    try {
      await loginWithPopup();
      await getAccessTokenSilently(); // Ensure token is fetched post-login
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    setUserRole(null);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className='navbar-logo-a'>
        <div className="navbar-logo" >
          <FaLeaf className="logo-icon" /> FarmTrust
        </div>
      </Link>

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
            <FaBell onClick={handleLogout} /> 
            <span className="badge">3</span>
          </div>
          <div className="icon-wrapper">
            <FaComment />
            <span className="badge">2</span>
          </div>
        </div>

        {isLoading || loading ? (
          <img
            src="https://www.svgrepo.com/download/192247/man-user.svg"
            alt="Loading"
            className="profile-pic"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
        ) : isAuthenticated ? (
          <div style={{ cursor: 'pointer' }} onClick={handleProfileClick}>
            <img
              src={user?.picture || 'https://www.svgrepo.com/download/192247/man-user.svg'}
              alt="Profile"
              className="profile-pic"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              onError={(e) => {
                e.target.src = 'https://www.svgrepo.com/download/192247/man-user.svg';
              }}
            />
          </div>
        ) : (
          <div
            id="signin"
            onClick={handleSignIn}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <button className="sign-in-btn">Sign In</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;