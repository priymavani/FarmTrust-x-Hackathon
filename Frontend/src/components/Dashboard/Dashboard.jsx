// Dashboard.jsx
import React from 'react';
import './Dashboard.css';
import { FaBox, FaShoppingCart, FaHourglassHalf, FaRupeeSign } from 'react-icons/fa';
import rajesh from '../../assets/rajesh.jpg';
import riya from '../../assets/priya-singh.jpg';
import yash from '../../assets/yash.jpg';

const Dashboard = () => {
  return (
    <>
      {/* Header */}
      <div className='da-dashboard'>
        <div className="da-header">
          <div className="da-welcome-message">
            <h1>Welcome back, John!</h1>
            <p>Here's what's happening with your farm today</p>
          </div>
          <div className="da-user-profile">
            <img src={rajesh} alt="Profile" className="da-profile-image" />
          </div>
        </div>

        <div className="da-stats-container">
          <div className="da-stat-card">
            <div className="da-stat-info">
              <h4>Total Products</h4>
              <h2>24</h2>
            </div>
            <div className="da-stat-icon da-green">
              <span><FaBox /></span>
            </div>
          </div>

          <div className="da-stat-card">
            <div className="da-stat-info">
              <h4>Total Orders</h4>
              <h2>156</h2>
            </div>
            <div className="da-stat-icon da-blue">
              <span><FaShoppingCart /></span>
            </div>
          </div>

          <div className="da-stat-card">
            <div className="da-stat-info">
              <h4>Pending Orders</h4>
              <h2>8</h2>
            </div>
            <div className="da-stat-icon da-yellow">
              <span><FaHourglassHalf /></span>
            </div>
          </div>

          <div className="da-stat-card">
            <div className="da-stat-info">
              <h4>Total Earnings</h4>
              <h2>₹24,500</h2>
            </div>
            <div className="da-stat-icon da-purple">
              <span><FaRupeeSign /></span>
            </div>
          </div>
        </div>

        <div className="da-section">
          <h3>Recent Orders</h3>
          <div className="da-table-responsive">
            <table className="da-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Organic Tomatoes</td>
                  <td>
                    <div className="da-customer-info">
                      <img src={riya} alt="Customer" />
                      <span>John Doe</span>
                    </div>
                  </td>
                  <td>5 kg</td>
                  <td>₹250</td>
                  <td><span className="da-status da-pending">Pending</span></td>
                </tr>
                <tr>
                  <td>Organic Carrots</td>
                  <td>
                    <div className="da-customer-info">
                      <img src={yash} alt="Customer" />
                      <span>Sarah Johnson</span>
                    </div>
                  </td>
                  <td>3 kg</td>
                  <td>₹180</td>
                  <td><span className="da-status da-confirmed">Confirmed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="da-section da-messages-section">
          <div className="da-section-header">
            <h3>Recent Messages</h3>
            <a href="#" className="da-view-all">View All</a>
          </div>

          <div className="da-message-list">
            <div className="da-message-item">
              <img src={riya} alt="Sarah" className="da-message-avatar" />
              <div className="da-message-content">
                <div className="da-message-header">
                  <h4>Sarah Johnson</h4>
                  <span className="da-message-time">2 hours ago</span>
                </div>
                <p className="da-message-text">Is the organic certification valid?</p>
              </div>
            </div>

            <div className="da-message-item">
              <img src={yash} alt="Mike" className="da-message-avatar" />
              <div className="da-message-content">
                <div className="da-message-header">
                  <h4>Mike Smith</h4>
                  <span className="da-message-time">5 hours ago</span>
                </div>
                <p className="da-message-text">When will fresh carrots be back in stock?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;