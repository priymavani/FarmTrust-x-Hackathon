import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaSearch, FaCheck, FaTimes, FaAngleDown } from 'react-icons/fa';
import './FarmerOrders.css';
import { getAllOrders, getProductById, getFarmerByEmail } from '../api';

const FarmerOrders = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All Orders");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [farmerId, setFarmerId] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const fetchFarmerAndOrders = async () => {
      if (!isAuthenticated || !user?.email) return;
      try {
        const token = await getAccessTokenSilently();

        // Fetch farmer's _id using Auth0 email
        const farmerData = await getFarmerByEmail(user.email, token);
        if (!farmerData || !farmerData._id) {
          throw new Error('Farmer not found');
        }
        setFarmerId(farmerData._id);

        // Fetch all orders and filter by farmerId
        const allOrders = await getAllOrders(token);
        const farmerOrders = allOrders.filter(order => order.farmerId === farmerData._id);

        // Enrich orders with product images using productId
        const enrichedOrders = await Promise.all(
          farmerOrders.map(async (order) => {
            const product = order.products[0]; // Assuming one product per order
            let productImage = 'https://via.placeholder.com/150'; // Default image
            try {
              const productData = await getProductById(product.productId); // Fetch product by productId
              productImage = productData?.product?.images?.[0] || productImage; // Use first image from response
            } catch (err) {
              console.error(`Failed to fetch image for product ${product.productId}:`, err);
            }
            return {
              ...order,
              id: order.id,
              orderDate: new Date(order.orderedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              }),
              productName: product.name,
              productImage, // Set fetched image
              consumer: order.userName,
              consumerImage: 'https://via.placeholder.com/50', // Static consumer image
              quantity: `${product.quantityInKg} Kg`,
              totalPrice: `₹${order.totalAmount.toFixed(2)}`,
              status: order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase(),
              consumerDetails: {
                address: order.userAddress,
                contactNumber: order.userPhone === "Not provided" ? "N/A" : order.userPhone,
              },
            };
          })
        );

        setOrders(enrichedOrders);
        setFilteredOrders(enrichedOrders);
      } catch (err) {
        setError('Failed to fetch farmer data or orders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmerAndOrders();
  }, [isAuthenticated, user?.email, getAccessTokenSilently]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterOrders = (status) => {
    setOrderFilter(status);
    setIsFilterOpen(false);
    if (status === "All Orders") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  const sortOrders = (sortType) => {
    setSortOrder(sortType);
    setIsSortOpen(false);
    let sorted = [...filteredOrders];
    if (sortType === "Newest First") {
      sorted.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
    } else {
      sorted.sort((a, b) => new Date(a.orderedAt) - new Date(b.orderedAt));
    }
    setFilteredOrders(sorted);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.trim() === "") {
      filterOrders(orderFilter);
    } else {
      setFilteredOrders(
        orders.filter(order =>
          order.consumer.toLowerCase().includes(term) ||
          order.productName.toLowerCase().includes(term)
        )
      );
    }
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    setFilteredOrders(updatedOrders.filter(order =>
      orderFilter === "All Orders" || order.status === orderFilter
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    // TODO: Add PATCH request to update status on backend
  };

  if (loading) return <div className="orders-page">Loading...</div>;
  if (error) return <div className="orders-page">{error}</div>;

  console.log(filteredOrders)

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="search-icon-d" />
        </div>
      </div>

      <div className="filter-sort-container">
        <div className="filter-dropdown" ref={filterDropdownRef}>
          <button className="dropdown-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            {orderFilter} <FaAngleDown />
          </button>
          {isFilterOpen && (
            <div className="dropdown-content">
              <div onClick={() => filterOrders("All Orders")}>All Orders</div>
              <div onClick={() => filterOrders("Pending")}>Pending</div>
              <div onClick={() => filterOrders("Confirmed")}>Confirmed</div>
              <div onClick={() => filterOrders("Canceled")}>Canceled</div>
            </div>
          )}
        </div>

        <div className="sort-dropdown" ref={sortDropdownRef}>
          <button className="dropdown-button" onClick={() => setIsSortOpen(!isSortOpen)}>
            Sort: {sortOrder} <FaAngleDown />
          </button>
          {isSortOpen && (
            <div className="dropdown-content">
              <div onClick={() => sortOrders("Newest First")}>Newest First</div>
              <div onClick={() => sortOrders("Oldest First")}>Oldest First</div>
            </div>
          )}
        </div>
      </div>

      <div className="orders-table">
        <div className="table-header">
          <div className="header-item">Order Date</div>
          <div className="header-item">Product</div>
          <div className="header-item">Consumer</div>
          <div className="header-item">Quantity</div>
          <div className="header-item">Total Price</div>
          <div className="header-item">Status</div>
          <div className="header-item">Actions</div>
        </div>

        {filteredOrders.map(order => (
          <div key={order.id} className="order-row" onClick={() => openOrderModal(order)}>
            <div className="order-item">{order.orderDate}</div>
            <div className="order-item product-item-d3">
              <img src={order.productImage} alt={order.productName} className="product-thumbnail-d3" />
              <span>{order.productName}</span>
            </div>
            <div className="order-item consumer-item">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPOnPAaq91xDOeIxxT9lMloWMnI28uSVjdANj1ksh4qbXb_gpDNZScToiVO32F9l__UD8&usqp=CAU" alt={order.consumer} className="consumer-thumbnail" />
              <span>{order.consumer}</span>
            </div>
            <div className="order-item">{order.quantity}</div>
            <div className="order-item">{order.totalPrice}</div>
            <div className="order-item">
              <span className={`order-status-d1 ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-item actions-d3">
              <button
                className="action-btn-d3 approve-d3"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(order.id, "Confirmed");
                }}
              >
                <FaCheck />
              </button>
              <button
                className="action-btn-d3 reject-d3"
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(order.id, "Canceled");
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="no-orders">No orders found</div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn2" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="product-details-d3">
                <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="product-image-d3" />
                <div className="product-info-d3">
                  <h3>{selectedOrder.productName}</h3>
                  <div className="order-detail">
                    <span>Order Date: {selectedOrder.orderDate}</span>
                  </div>
                  <div className="order-detail">
                    <span>Quantity: {selectedOrder.quantity}</span>
                  </div>
                  <div className="order-detail price">
                    <span>Total: {selectedOrder.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="consumer-details">
                <h3>Consumer Details</h3>
                <div className="consumer-info">
                  <div className="consumer-avatar">
                    <img src={selectedOrder.consumerImage} alt={selectedOrder.consumer} />
                    <span>{selectedOrder.consumer}</span>
                  </div>
                  <div className="consumer-contact">
                    <div><strong>Address:</strong> {selectedOrder.consumerDetails.address}</div>
                    <div><strong>Contact:</strong> {selectedOrder.consumerDetails.contactNumber}</div>
                  </div>
                </div>
              </div>

              <div className="order-actions-d3">
                <div className="status-update-d3">
                  <span>Status: </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className={`status-dropdown-d3 ${selectedOrder.status.toLowerCase()}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;