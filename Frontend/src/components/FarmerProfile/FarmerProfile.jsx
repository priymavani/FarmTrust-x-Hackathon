import React from 'react';

import './FarmerProfile.css';
import { FaEnvelope, FaPhoneAlt, FaFlag } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';
import { FiMessageCircle } from 'react-icons/fi';
import { FaLocationDot } from 'react-icons/fa6';
import { IoStar, IoLeaf } from 'react-icons/io5';
import FarmerImage from '../../assets/Rajesh-kumar1.jpg';
import Tomatoes from '../../assets/Organic-Tomatoes.jpg';
import Carrots from '../../assets/Organic-Carrots.jpg';
import Spinach from '../../assets/Organic-Spinach.jpg';
import Potatoes from '../../assets/Organic-Potatoes.jpg';
import Image1 from '../../assets/priya-singh.jpg';
import Image2 from '../../assets/rajesh-kumar.jpg';

const FarmerProfile = () => {
  // Static farmer data based on the image
  const farmer = {
    name: "Rajesh Kumar",
    isVerified: true,
    email: "rajesh.kumar@farmtrust.com",
    phone: "+91 98765 43210",
    address: {
      city: "Nashik",
      state: "Maharashtra"
    },
    profilePic: FarmerImage, // Replace with actual image URL
    description: "With over 15 years of experience in natural farming, I specialize in growing organic vegetables and fruits using traditional farming methods. Our farm follows sustainable practices, avoiding chemical pesticides and fertilizers. We take pride in delivering fresh, healthy produce directly from our fields to your table.",
    certificates: {
      fssai: "#",
      organicFarm: "#"
    },
    farmerRating: "4.2",
    reviewCount: "128",
    products: [
      {
        id: "1",
        name: "Organic Tomatoes",
        mrpPerKg: 4.99,
        images: Tomatoes,
        unit: "kg"
      },
      {
        id: "2",
        name: "Organic Carrots",
        mrpPerKg: 3.99,
        images: Carrots,
        unit: "Kg"
      },
      {
        id: "3",
        name: "Organic Spinach",
        mrpPerKg: 2.99,
        images: Spinach,
        unit: "Kg"
      },
      {
        id: "4",
        name: "Organic Potatoes",
        mrpPerKg: 3.49,
        images: Potatoes,
        unit: "Kg"
      },
    ],
    reviews: [
      {
        id: "1",
        name: "Sarah Johnson",
        date: "2 days ago",
        rating: 5,
        comment: "The vegetables are always fresh and the service is excellent. Really appreciate the sustainable farming practices!",
        profilePic: Image1
      },
      {
        id: "2",
        name: "Michael Chen",
          date: "1 week ago",
        rating: 4,
        comment: "Quality products and reliable delivery. The organic certification gives me confidence in the produce.",
        profilePic: Image2
      }
    ]
  };

  return (
    <div className="farmer-profile-container">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-card">
          <div className="profile-header">
            <img src={farmer.profilePic} alt={farmer.name} className="profile-image" />
            <div className="profile-info">
              <h2>
                {farmer.name} {farmer.isVerified && <span className="verified"><MdVerifiedUser /></span>}
              </h2>
              <p className="trusted-by">
                <MdVerifiedUser /> Trusted by FarmTrust
              </p>
              <p className="contact-info">
                <FaEnvelope /> {farmer.email}
              </p>
              <p className="contact-info">
                <FaPhoneAlt /> {farmer.phone}
              </p>
              <p className="contact-info">
                <FaLocationDot /> {farmer.address.city}, {farmer.address.state}
              </p>
              <div className="contact-buttons">
               
                  <button className="message-btn">
                    <FiMessageCircle /> Message
                  </button>
                
                <button className="call-btn">
                  <FaPhoneAlt /> Call
                </button>
              </div>
            </div>
            <button className="report-btn">
              <FaFlag /> Report
            </button>
          </div>
        </div>
      </div>

      {/* Certifications Section */}
      <div className="certifications-section">
        <div className="certifications-card">
          <h3>Certifications</h3>
          <div className="certification-items">
            <div className="certification-item">
              <div className="cert-icon"><IoStar /></div>
              <p>FSSAI Certified <br /> Valid until Dec 2025</p>
              <a href="#" className="view-certificate-link">
                View Certificate
              </a>
            </div>
            <div className="certification-item">
              <div className="cert-icon"><IoLeaf /></div>
              <p>Organic Farming <br /> Valid until Nov 2025</p>
              <a href="#" className="view-certificate-link">
                View Certificate
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* About Farmer Section */}
      <div className="about-farmer-section">
        <div className="about-farmer-card">
          <h3>About the Farmer</h3>
          <p>{farmer.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-card">
          <div className="reviews-header">
            <h3>Reviews</h3>
            <div className="rating">
              <span className="stars">★★★★☆</span> {farmer.farmerRating} ({farmer.reviewCount} reviews)
            </div>
          </div>
          <div className="review-items">
            {farmer.reviews.map((review) => (
              <div key={review.id} className="review-item">
                <img src={review.profilePic} alt={review.name} className="review-profile-pic" />
                <div className="review-content">
                  <div className="review-header">
                    <span className="reviewer-name">{review.name}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-rating">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-reviews">
            <a href="#" className="view-all-link">View All Reviews →</a>
          </div>
        </div>
      </div>

      {/* Products Section - Updated with -d class names to match CSS */}
      <div className="products-section-d">
        <div className="products-card-d">
          <div className="products-header-d">
            <h3>Products</h3>
            <a href="#" className="view-all-link">View All</a>
          </div>
          <div className="products-grid-d">
            {farmer.products.map((product) => (
              <div key={product.id} className="product-item-d">
                <a href="#">
                  <img src={product.images} alt={product.name} className="product-image-d" />
                </a>
                <p className="product-name-d">{product.name}</p>
                <p className="product-price-d">
                  ₹{product.mrpPerKg}/{product.unit || 'kg'}
                </p>
                <div className="products123-d">
                  <a href="#" className="view-product-btn-d">
                    View Product
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;