import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './UserOrders.css';
import { getAllOrders, getProductById } from '../api'; // Adjust path to api.js

const UserOrders = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Fetch orders and product images on mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user?.email) return;
      try {
        const token = await getAccessTokenSilently();
        const allOrders = await getAllOrders(token);
        
        // Filter orders by the logged-in user's email
        const userOrders = allOrders.filter(order => order.userEmail === user.email);

        // Fetch product images for each order
        const ordersWithImages = await Promise.all(
          userOrders.map(async (order) => {
            const product = order.products[0]; // Assuming one product per order for simplicity
            const productData = await getProductById(product.productId, token);
            return {
              ...order,
              image: productData.product.images[0] || 'https://via.placeholder.com/150', // First image or fallback
            };
          })
        );

        setOrders(ordersWithImages);
      } catch (err) {
        setFetchError(err.message || 'Failed to load orders.');
      }
    };
    fetchOrders();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const filteredOrders = activeTab === 'All Orders'
    ? orders
    : orders.filter(order => order.status === activeTab.toLowerCase()); // Match case with API

  const getStatusClassName = (status) => {
    switch (status) {
      case 'pending': return 'status-pending-d4';
      case 'confirmed': return 'status-confirmed-d4';
      case 'cancelled': return 'status-canceled-d4';
      case 'shipped': return 'status-shipped-d4'; // Added for new status
      case 'delivered': return 'status-delivered-d4'; // Added for new status
      default: return '';
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in to view your orders.</div>;
  if (fetchError) return <div className="orders-container-d4">{fetchError}</div>;

  return (
    <div className="orders-container-d4">
      <div className="orders-header-d4">
        <h1>My Orders</h1>
        <p>Track and manage your orders seamlessly</p>
      </div>

      <div className="tabs-container-d4">
        {['All Orders', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
          <button
            key={tab}
            className={`tab-button-d4 ${activeTab === tab ? 'active-d4' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="orders-list-d4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div className="order-card-d4 product-d4" key={order.id}>
              <div className="order-image-d4 product-image-d4">
                <img src={order.image} alt={order.products[0].name} />
              </div>
              <div className="order-details-d4">
                <div className="order-info-d4">
                  <span className="order-id-d4">Order #{order.id}</span>
                  <h3 className="product-name-d4">{order.products[0].name}</h3>
                  <div className="product-quantity-d4">Quantity: {order.products[0].quantityInKg} Kg</div>
                  <div className="product-price-d4">₹{order.totalAmount.toFixed(2)}</div>
                  <div className="order-date-d4">Ordered on {new Date(order.orderedAt).toLocaleDateString()}</div>
                </div>
                <div className={`order-status-d4 ${getStatusClassName(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)} {/* Capitalize */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found for this status.</p>
        )}
      </div>
    </div>
  );
};

export default UserOrders;