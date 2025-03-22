import React, { useState } from 'react';
import { FaTag, FaLeaf, FaBoxOpen, FaStar, FaPen, FaTrash, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import './FarmerProducts.css';

// Import images from assets folder
import tomatoesImage from '../../assets/Organic-Tomatoes.jpg';
import applesImage from '../../assets/apples.jpg';

const FarmerProducts = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: '₹45/kg',
      category: 'Vegetables',
      subcategory: 'Seasonal',
      stock: '250 kg',
      inStock: true,
      rating: 4.5,
      reviews: 128,
      image: tomatoesImage,
      description: 'Fresh farm tomatoes, organically grown.'
    },
    {
      id: 2,
      name: 'Red Apples',
      price: '₹120/kg',
      category: 'Fruits',
      subcategory: 'Premium',
      stock: '0 kg',
      inStock: false,
      rating: 4.8,
      reviews: 256,
      image: applesImage,
      description: 'Sweet and juicy red apples from the hills.'
    }
  ]);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    subcategory: '',
    stock: '',
    description: '',
    images: [null, null, null, null]
  });

  const openEditPopup = (product) => {
    setCurrentProduct({...product});
    setShowEditPopup(true);
  };

  const openAddPopup = () => {
    setShowAddPopup(true);
  };

  const closeEditPopup = () => {
    setShowEditPopup(false);
    setCurrentProduct(null);
  };

  const closeAddPopup = () => {
    setShowAddPopup(false);
    setNewProduct({
      name: '',
      price: '',
      category: '',
      subcategory: '',
      stock: '',
      description: '',
      images: [null, null, null, null]
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleIndividualFileChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      
      const updatedImages = [...newProduct.images];
      updatedImages[index] = imageUrl;
      
      setNewProduct({
        ...newProduct,
        images: updatedImages
      });
    }
  };

  const saveEditChanges = () => {
    // Update the products array with edited product
    const updatedProducts = products.map(product => 
      product.id === currentProduct.id ? {...currentProduct} : product
    );
    setProducts(updatedProducts);
    closeEditPopup();
  };

  const addNewProduct = () => {
    // Filter out null images
    const validImages = newProduct.images.filter(img => img !== null);
    
    // Add new product to products array
    const productToAdd = {
      ...newProduct,
      id: products.length + 1,
      rating: 0,
      reviews: 0,
      inStock: parseInt(newProduct.stock) > 0,
      image: validImages.length > 0 ? validImages[0] : null
    };
    setProducts([...products, productToAdd]);
    closeAddPopup();
  };

  const toggleStockStatus = (productId) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          inStock: !product.inStock
        };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
  };

  const removeImage = (index) => {
    const updatedImages = [...newProduct.images];
    updatedImages[index] = null;
    
    setNewProduct({
      ...newProduct,
      images: updatedImages
    });
  };

  return (
    <div className="product-inventory-container">
      <div className="header">
        <div className="title-section">
          <h1>My Products</h1>
          <p>Manage your farm products inventory</p>
        </div>
        <button className="add-button" onClick={openAddPopup}>
          <FaPlus /> Add New Product
        </button>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image-d1" />
              <span className={`stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              
              <div className="product-info">
                <div className="info-item">
                  <FaTag className="icon" />
                  <span>{product.price}</span>
                </div>
                
                <div className="info-item">
                  <FaLeaf className="icon" />
                  <span>{product.category} {product.subcategory ? `- ${product.subcategory}` : ''}</span>
                </div>
                
                <div className="info-item">
                  <FaBoxOpen className="icon" />
                  <span>Stock: {product.stock}</span>
                </div>
                
                <div className="info-item">
                  <FaStar className="icon" />
                  <span>{product.rating} ({product.reviews} reviews)</span>
                </div>
              </div>
              
              <div className="product-actions">
                <button 
                  className={product.inStock ? "action-button stock-button" : "action-button restock-button"}
                  onClick={() => toggleStockStatus(product.id)}
                >
                  {product.inStock ? 'Mark Out of Stock' : 'Restock'}
                </button>
                <div className="icon-buttons">
                  <button className="icon-button edit" onClick={() => openEditPopup(product)}>
                    <FaPen />
                  </button>
                  <button className="icon-button delete" onClick={() => deleteProduct(product.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Product Popup */}
      {showEditPopup && currentProduct && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Edit Product</h2>
              <button className="close-button" onClick={closeEditPopup}>
                <FaTimes />
              </button>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={currentProduct.name} 
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input 
                  type="text" 
                  name="price" 
                  value={currentProduct.price} 
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={currentProduct.category} 
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <input 
                  type="text" 
                  name="subcategory" 
                  value={currentProduct.subcategory || ''} 
                  onChange={handleEditChange}
                  placeholder="e.g. Organic, Premium, Seasonal"
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input 
                  type="text" 
                  name="stock" 
                  value={currentProduct.stock} 
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={currentProduct.description} 
                  onChange={handleEditChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="popup-footer">
              <button className="cancel-button" onClick={closeEditPopup}>Cancel</button>
              <button className="save-button" onClick={saveEditChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Popup */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Add New Product</h2>
              <button className="close-button" onClick={closeAddPopup}>
                <FaTimes />
              </button>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Product Images (Up to 4)</label>
                <div className="individual-image-upload-container">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="individual-image-upload">
                      <div className={`image-preview ${!newProduct.images[index] ? 'empty' : ''}`}>
                        {newProduct.images[index] ? (
                          <>
                            <img src={newProduct.images[index]} alt={`Product ${index + 1}`} />
                            <button 
                              className="remove-image-btn" 
                              onClick={() => removeImage(index)}
                              type="button"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <div className="upload-placeholder">
                            <input 
                              type="file" 
                              id={`product-image-d1-${index}`} 
                              accept="image/*" 
                              onChange={(e) => handleIndividualFileChange(e, index)}
                              className="file-input"
                            />
                            <label htmlFor={`product-image-d1-${index}`} className="upload-label-small">
                              <FaUpload />
                              <span>Image {index + 1}</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newProduct.name} 
                  onChange={handleAddChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input 
                  type="text" 
                  name="price" 
                  value={newProduct.price} 
                  onChange={handleAddChange}
                  placeholder="e.g. ₹50/kg"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={newProduct.category} 
                  onChange={handleAddChange}
                  placeholder="e.g. Fruits, Vegetables"
                />
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <input 
                  type="text" 
                  name="subcategory" 
                  value={newProduct.subcategory} 
                  onChange={handleAddChange}
                  placeholder="e.g. Organic, Premium, Seasonal"
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input 
                  type="text" 
                  name="stock" 
                  value={newProduct.stock} 
                  onChange={handleAddChange}
                  placeholder="e.g. 100 kg"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={newProduct.description} 
                  onChange={handleAddChange}
                  rows="3"
                  placeholder="Enter product description"
                ></textarea>
              </div>
            </div>
            <div className="popup-footer">
              <button className="cancel-button" onClick={closeAddPopup}>Cancel</button>
              <button className="save-button" onClick={addNewProduct}>Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProducts;