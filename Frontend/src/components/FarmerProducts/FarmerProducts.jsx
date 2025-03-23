import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaTag, FaLeaf, FaBoxOpen, FaStar, FaPen, FaTrash, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import './FarmerProducts.css';
import { getFarmerByEmail, updateFarmer } from '../api';

const FarmerProducts = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [products, setProducts] = useState([]);
  const [farmerId, setFarmerId] = useState(null);
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
    images: [null, null, null, null],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmerProducts = async () => {
      if (!isAuthenticated || !user?.email) return;

      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        const farmerData = await getFarmerByEmail(user.email, token);
        if (!farmerData) throw new Error('Farmer not found');
        setFarmerId(farmerData._id);

        const fetchedProducts = farmerData.products.map(product => ({
          id: product.id,
          name: product.name,
          price: `₹${product.mrpPerKg}/kg`,
          category: product.category,
          subcategory: product.subcategory || '',
          stock: `${product.stockInKg} kg`,
          inStock: product.stockInKg > 0,
          rating: 0,
          reviews: 0,
          image: product.images[0] || 'https://via.placeholder.com/150',
          images: product.images.length ? product.images : [null, null, null, null],
          description: product.description || '',
        }));

        setProducts(fetchedProducts);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerProducts();
  }, [isAuthenticated, user?.email, getAccessTokenSilently]);

  const openEditPopup = (product) => {
    setCurrentProduct({ ...product });
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
      images: [null, null, null, null],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleIndividualFileChange = (e, index) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedImages = [...(currentProduct?.images || newProduct.images)];
      updatedImages[index] = file;
      if (currentProduct) {
        setCurrentProduct({ ...currentProduct, images: updatedImages });
      } else {
        setNewProduct({ ...newProduct, images: updatedImages });
      }
    }
  };

  const saveEditChanges = async () => {
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      const productData = {
        id: currentProduct.id,
        name: currentProduct.name,
        mrpPerKg: parseFloat(currentProduct.price.replace('₹', '').replace('/kg', '')),
        category: currentProduct.category,
        subcategory: currentProduct.subcategory || '',
        stockInKg: parseFloat(currentProduct.stock.replace(' kg', '')),
        description: currentProduct.description,
      };
  
      formData.append('products', JSON.stringify([productData]));
      currentProduct.images.forEach((img, index) => {
        if (img instanceof File) {
          formData.append('productImages', img);
        }
      });
  
      console.log('Sending PATCH request with:', {
        farmerId,
        productData,
        images: currentProduct.images.filter(img => img instanceof File).map(img => img.name),
      });
  
      const updatedFarmer = await updateFarmer(farmerId, formData, token);
      console.log('Backend response:', updatedFarmer);
  
      if (!updatedFarmer || !Array.isArray(updatedFarmer.products)) {
        throw new Error('Invalid response from server: missing or invalid products array');
      }
  
      const updatedProduct = updatedFarmer.products.find(p => p.id === currentProduct.id);
      if (!updatedProduct) {
        console.warn(`Product with ID ${currentProduct.id} not found in response. Using local data as fallback.`);
        // Fallback to local data if not found (assuming update succeeded)
        setProducts(products.map(p =>
          p.id === currentProduct.id ? {
            ...p,
            name: productData.name,
            price: `₹${productData.mrpPerKg}/kg`,
            category: productData.category,
            subcategory: productData.subcategory || '',
            stock: `${productData.stockInKg} kg`,
            inStock: productData.stockInKg > 0,
            image: p.image, // Preserve existing image if no new ones uploaded
            images: currentProduct.images.filter(img => img), // Filter out nulls
            description: productData.description,
          } : p
        ));
      } else {
        setProducts(products.map(p =>
          p.id === currentProduct.id ? {
            ...p,
            name: updatedProduct.name,
            price: `₹${updatedProduct.mrpPerKg}/kg`,
            category: updatedProduct.category,
            subcategory: updatedProduct.subcategory || '',
            stock: `${updatedProduct.stockInKg} kg`,
            inStock: updatedProduct.stockInKg > 0,
            image: updatedProduct.images[0] || 'https://via.placeholder.com/150',
            images: updatedProduct.images.length ? updatedProduct.images : [null, null, null, null],
            description: updatedProduct.description,
          } : p
        ));
      }
  
      closeEditPopup();
    } catch (err) {
      console.error('Error in saveEditChanges:', err.message, err.stack);
      setError(`Failed to update product: ${err.message}`);
    }
  };

  const addNewProduct = async () => {
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      const productData = {
        name: newProduct.name,
        mrpPerKg: parseFloat(newProduct.price.replace('₹', '').replace('/kg', '')),
        category: newProduct.category,
        subcategory: newProduct.subcategory || '',
        stockInKg: parseFloat(newProduct.stock.replace(' kg', '')),
        description: newProduct.description,
      };

      formData.append('products', JSON.stringify([productData]));
      newProduct.images.forEach((img, index) => {
        if (img instanceof File) {
          formData.append('productImages', img);
        }
      });

      const updatedFarmer = await updateFarmer(farmerId, formData, token);
      const newBackendProduct = updatedFarmer.products[updatedFarmer.products.length - 1];
      const newProductWithId = {
        id: newBackendProduct.id,
        name: newProduct.name,
        price: `₹${newBackendProduct.mrpPerKg}/kg`,
        category: newProduct.category,
        subcategory: newProduct.subcategory || '',
        stock: `${newBackendProduct.stockInKg} kg`,
        inStock: newBackendProduct.stockInKg > 0,
        rating: 0,
        reviews: 0,
        image: newBackendProduct.images[0] || 'https://via.placeholder.com/150',
        images: newBackendProduct.images.length ? newBackendProduct.images : [null, null, null, null],
        description: newProduct.description,
      };

      setProducts([...products, newProductWithId]);
      closeAddPopup();
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product');
    }
  };

  const toggleStockStatus = (productId) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, inStock: !product.inStock } : product
    );
    setProducts(updatedProducts);
  };

  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
  };

  const removeImage = (index) => {
    const updatedImages = [...(currentProduct?.images || newProduct.images)];
    updatedImages[index] = null;
    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, images: updatedImages });
    } else {
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
                <label>Product Images (Up to 4)</label>
                <div className="individual-image-upload-container">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="individual-image-upload">
                      <div className={`image-preview ${!currentProduct.images[index] ? 'empty' : ''}`}>
                        {currentProduct.images[index] ? (
                          <>
                            <img
                              src={currentProduct.images[index] instanceof File
                                ? URL.createObjectURL(currentProduct.images[index])
                                : currentProduct.images[index]}
                              alt={`Product ${index + 1}`}
                            />
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
                              id={`edit-product-image-${index}`}
                              accept="image/*"
                              onChange={(e) => handleIndividualFileChange(e, index)}
                              className="file-input"
                            />
                            <label htmlFor={`edit-product-image-${index}`} className="upload-label-small">
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
                <input type="text" name="name" value={currentProduct.name} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="text" name="price" value={currentProduct.price} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={currentProduct.category} onChange={handleEditChange} />
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
                <input type="text" name="stock" value={currentProduct.stock} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={currentProduct.description} onChange={handleEditChange} rows="3" />
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
                            <img
                              src={URL.createObjectURL(newProduct.images[index])}
                              alt={`Product ${index + 1}`}
                            />
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
                />
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