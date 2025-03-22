import React, { useState } from 'react';
import './UserOrders.css'
import Image1 from '../../assets/Organic-Tomatoes.jpg';
import Image2 from '../../assets/Organic-Potatoes.jpg';
import Image3 from '../../assets/Organic-Carrots.jpg';
const UserOrders = () => {
  const [activeTab, setActiveTab] = useState('All Orders');
  
  const orders = [
    {
      id: 'T283745',
      product: 'Organic Tomatoes',
      quantity: '5 Kg',
      price: '₹450.00',
      date: '15/02/2025',
      status: 'Pending',
      image: Image1
    },
    {
      id: 'T283746',
      product: 'Organic Carrots',
      quantity: '3 Kg',
      price: '₹225.00',
      date: '14/02/2025',
      status: 'Confirmed',
      image: Image2
    },
    {
      id: 'T283747',
      product: 'Organic Potatoes',
      quantity: '10 Kg',
      price: '₹600.00',
      date: '13/02/2025',
      status: 'Canceled',
      image: Image3
    }
  ];

  const filteredOrders = activeTab === 'All Orders' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusClassName = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending-d4';
      case 'Confirmed': return 'status-confirmed-d4';
      case 'Canceled': return 'status-canceled-d4';
      default: return '';
    }
  };

  return (
    <div className="orders-container-d4">
      <div className="orders-header-d4">
        <h1>My Orders</h1>
        <p>Track and manage your orders seamlessly</p>
      </div>
      
      <div className="tabs-container-d4">
        {['All Orders', 'Pending', 'Confirmed', 'Canceled'].map(tab => (
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
        {filteredOrders.map(order => (
          <div className="order-card-d4 product-d4" key={order.id}>
            <div className="order-image-d4 product-image-d4">
              <img src={order.image} alt={order.product} />
            </div>
            <div className="order-details-d4">
              <div className="order-info-d4">
                <span className="order-id-d4">Order #{order.id}</span>
                <h3 className="product-name-d4">{order.product}</h3>
                <div className="product-quantity-d4">Quantity: {order.quantity}</div>
                <div className="product-price-d4">{order.price}</div>
                <div className="order-date-d4">Ordered on {order.date}</div>
              </div>
              <div className={`order-status-d4 ${getStatusClassName(order.status)}`}>
                {order.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrders;