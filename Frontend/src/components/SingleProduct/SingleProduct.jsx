import React, { useState } from 'react';
import './SingleProduct.css';

const SingleProduct = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Product images array
  const productImages = [
    'https://images.unsplash.com/photo-1524593166156-312f362cada0?q=80&w=500',
    'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?q=80&w=500',
    'https://images.unsplash.com/photo-1566383444833-43afb88e5dc9?q=80&w=500',
    'https://images.unsplash.com/photo-1524593166156-312f362cada0?q=80&w=500'
  ];

  return (
    <div className="p-product-page">
      <div className="p-product-container">
        <div className="p-product-image-section">
          <div className="p-main-image">
            <img src={productImages[selectedImage]} alt="Organic Farm-Fresh Tomatoes" />
          </div>
          
          <div className="p-thumbnail-images">
            {productImages.map((image, index) => (
              <div 
                key={index} 
                className={`p-thumbnail ${selectedImage === index ? 'p-active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-product-details">
          <h1>Organic Farm-Fresh Tomatoes</h1>
          <p className="p-product-description">
            Premium quality, locally grown organic tomatoes. Harvested daily for maximum freshness and taste.
          </p>
          
          <div className="p-product-price">
            <span>₹499/kg</span>
          </div>
          
          <div className="p-seller-info">
            <div className="p-seller-profile">
              <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Seller" />
              <div className="p-seller-details">
                <p className="p-seller-name">Rajesh Kumar <span className="p-verified-icon">✓</span></p>
                <p className="p-seller-title">Verified Farmer</p>
              </div>
            </div>
            
            <div className="p-seller-actions">
              <button className="p-view-certificate">View Certificate</button>
              <button className="p-report-store">
                <span className="p-flag-icon">⚑</span> Report Store
              </button>
            </div>
          </div>
          
          <div className="p-profile-link">
            <a href="#profile">View Profile</a>
          </div>
          
          <div className="p-action-buttons">
            <button className="p-buy-now-btn">Buy Now</button>
            <button className="p-add-to-cart-btn">Add to Cart</button>
          </div>
        </div>
      </div>
      
      <div className="p-related-products-section">
        <h2>Related Products</h2>
        <div className="p-related-products">
          <div className="p-related-product">
            <div className="p-related-product-image">
              <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=300" alt="Organic Potatoes" />
            </div>
            <h3>Organic Potatoes</h3>
            <p className="p-related-price">₹220/kg</p>
          </div>
          {/* You can add more related products here */}
        </div>
      </div>
      
      <div className="p-reviews-section">
        <h2>Customer Reviews</h2>
        
        <div className="p-write-review">
          <h3>Write a Review</h3>
          <div className="p-rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="p-star">★</span>
            ))}
          </div>
          <textarea placeholder="Share your experience..."></textarea>
          <button className="p-submit-review">Submit Review</button>
        </div>
        
        <div className="p-review">
          <div className="p-reviewer-info">
            <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Reviewer" />
            <div>
              <p className="p-reviewer-name">Riya Sharma</p>
              <div className="p-reviewer-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="p-star p-filled">★</span>
                ))}
              </div>
            </div>
          </div>
          <p className="p-review-text">Excellent quality tomatoes! Very fresh and tasty. Will definitely buy again.</p>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;