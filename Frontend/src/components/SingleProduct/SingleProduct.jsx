import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SingleProduct.css';
import { getProductById, getAllProducts } from '../api';

const SingleProduct = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFssaiIframe, setShowFssaiIframe] = useState(false);
  const [showOrganicIframe, setShowOrganicIframe] = useState(false);

  const { productId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        const allProductsData = await getAllProducts();

        setProduct(productData.product);

        const related = allProductsData.products
          .filter(p => p.category === productData.product.category && p.id !== productId)
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.mrpPerKg,
            image: p.images[0] || 'https://via.placeholder.com/300',
          }));
        setRelatedProducts(related);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= roundedRating ? 'p-star p-filled' : 'p-star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <div className="p-product-page">Loading product...</div>;
  if (error || !product) return <div className="p-product-page">{error || 'Product not found'}</div>;

  const productImages = product.images.length > 0
    ? product.images
    : ['https://via.placeholder.com/500'];

  return (
    <div className="p-product-page">
      <div className="p-product-container">
        <div className="p-product-image-section">
          <div className="p-main-image">
            <img src={productImages[selectedImage]} alt={product.name} />
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
          <h1>{product.name}</h1>
          <p className="p-product-description">
            {product.description || 'No description available.'}
          </p>

          <div className="p-product-price">
            <span>₹{product.mrpPerKg}/kg</span>
          </div>

          <div className="p-seller-info">
            <div className="p-seller-profile">
              <img
                src={product.farmer.profilePic || 'https://randomuser.me/api/portraits/men/42.jpg'}
                alt="Seller"
              />
              <div className="p-seller-details">
                <p className="p-seller-name">
                  {product.farmer.name}
                  {product.farmer.isVerified && <span className="p-verified-icon">✓</span>}
                </p>
                {product.farmer.isVerified && (
                  <p className="p-seller-title">Trusted By FarmTrust</p>
                )}
              </div>
            </div>
            <div className="p-profile-link">
              <a href="#profile">View Profile</a>
            </div>
            <div className="p-seller-actions">
              <button className="p-report-store">
                <span className="p-flag-icon">⚑</span> Report Store
              </button>
            </div>

          </div>

          {/* Certificate Buttons Moved Here */}
          <div className="p-certificate-buttons">
            {product.farmer.certificates.fssai && (
              <button
                className="p-view-certificate"
                onClick={() => setShowFssaiIframe(!showFssaiIframe)}
              >
                FSSAI Certificate
              </button>
            )}
            {product.farmer.certificates.organicFarm && (
              <button
                className="p-view-certificate"
                onClick={() => setShowOrganicIframe(!showOrganicIframe)}
              >
                Organic Certificate
              </button>
            )}
          </div>



          <div className="p-action-buttons">
            <button className="p-buy-now-btn">Buy Now</button>
            <button className="p-add-to-cart-btn">Add to Cart</button>
          </div>
        </div>
      </div>

      {(showFssaiIframe || showOrganicIframe) && (
        <div className="p-certificates-section">
          {showFssaiIframe && product.farmer.certificates.fssai && (
            <div className="p-certificate-iframe">
              <button onClick={() => setShowFssaiIframe(false)}>Close</button>
              <h3>FSSAI Certificate</h3>
              <iframe
                src={`${product.farmer.certificates.fssai}#view=FitH&toolbar=0&navpanes=0`}
                title="FSSAI Certificate"
                width="100%"
                height="500px"
              />
            </div>
          )}
          {showOrganicIframe && product.farmer.certificates.organicFarm && (
            <div className="p-certificate-iframe">
              <button onClick={() => setShowOrganicIframe(false)}>Close</button>
              <h3>Organic Certificate</h3>
              <iframe
                src={`${product.farmer.certificates.organicFarm}#view=FitH&toolbar=0&navpanes=0`}
                title="Organic Certificate"
                width="100%"
                height="500px"
              />
            </div>
          )}
        </div>
      )}

      <div className="p-related-products-section">
        <h2>Related Products</h2>
        <div className="p-related-products">
          {relatedProducts.map(related => (
            <Link to={`/product/${related.id}`} key={related.id}>
              <div className="p-related-product">
                <div className="p-related-product-image">
                  <img src={related.image} alt={related.name} />
                </div>
                <h3>{related.name}</h3>
                <p className="p-related-price">₹{related.price}/kg</p>
              </div>
            </Link>
          ))}
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
                {renderStars(product.rating.average)}
              </div>
            </div>
          </div>
          <p className="p-review-text">Excellent quality! Very fresh and tasty. Will definitely buy again.</p>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;