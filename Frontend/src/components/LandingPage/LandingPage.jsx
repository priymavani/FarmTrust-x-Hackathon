import React from 'react';
import './LandingPage.css';
import farmersImage from '../../assets/farmers-illustration.jpg';
import organicVegetables from '../../assets/organic-vegetables.jpg';
import freshFruits from '../../assets/fresh-fruits.jpg';
import organicGrains from '../../assets/organic-grains.jpg';
import rajeshKumar from '../../assets/rajesh-kumar.jpg';
import priyaSingh from '../../assets/priya-singh.jpg';
import amitPatel from '../../assets/rajesh-kumar.jpg';
import organicCompost from '../../assets/organic-compost.jpg';
import naturalPestControl from '../../assets/natural-pest-control.jpg';
import soilEnricher from '../../assets/soil-enricher.jpg';
import { FaUserPlus, FaCheck, FaStore, FaSearch, FaShoppingCart, FaCertificate, FaStar, FaUser } from 'react-icons/fa';
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdVerifiedUser } from "react-icons/md";
import { BiLeaf } from "react-icons/bi";
import { Link } from 'react-router-dom';


const LandingPage = () => {

  // Function to render stars based on rating and total
  const renderStars = (rating, total = 5) => {
    const stars = [];
    for (let i = 1; i <= total; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'star-icon-d6 filled-d6' : 'star-icon-d6 empty-d6'}
        />
      );
    }
    return (
      <div className="stars-d6">
        {stars}
        <span className="review-count-d6">{rating}/{total}</span>
      </div>
    );
  };

  const handleApplyForFarmer = () => {
    // Handle farmer application logic
    console.log("Apply for farmer clicked");
  };

  return (
    <div className="landing-page-d6">

      <div className="banner-section-d6">
        <div className="farmer-banner-d6">
          <div className="banner-content-d6">
            <h1 className="banner-title-d6">Empowering Farmers, Ensuring Authenticity</h1>
            <p className="banner-description-d6">A transparent marketplace connecting consumers with certified natural farmers.</p>
            <div>
              <button
                className="explore-button-d6"
                style={{ backgroundColor: 'black', marginRight: '10px' }}
                onClick={handleApplyForFarmer}
              >
                Apply for Farmer
              </button>
              <button className="explore-button-d6">Explore Products</button>
            </div>
          </div>
          <div className="banner-image-d6">
            <img src={farmersImage} alt="Farmers Illustration" />
          </div>
        </div>
      </div>

      <div className="content-d6">
        {/* Why Choose Us Section */}
        <div className="why-choose-us-d6">
          <h2 className="section-title-d6">Why Choose Us</h2>
          <div className="features-d6">
            <div className="feature-item-d6">
              <MdVerifiedUser className="feature-icon-d6" />
              <h3 className="feature-title-d6">Verified Farmers</h3>
              <p className="feature-description-d6">Trust is authentically guaranteed through our rigorous verification process.</p>
            </div>
            <div className="feature-item-d6">
              <FaStore className="feature-icon-d6" />
              <h3 className="feature-title-d6">Direct Market</h3>
              <p className="feature-description-d6">No middlemen ensuring fair pricing for both farmers and consumers.</p>
            </div>
            <div className="feature-item-d6">
              <FaCertificate className="feature-icon-d6" />
              <h3 className="feature-title-d6">Certified Farmers</h3>
              <p className="feature-description-d6">FSSAI, Organic, and other certifications verified.</p>
            </div>
          </div>
        </div>

        {/* Guide Section */}
        <div className="guide-section-d6">
          <h2 className="section-title-d6">Your Guide to a Transparent Marketplace</h2>
          <div className="guides-container-d6">
            <div className="guide-card-d6">
              <div className="guide-icon-d6">
                <BiLeaf />
              </div>
              <h3 className="guide-title-d6">Farmer Guide</h3>
              <p className="guide-description-d6">Learn how to register, get verified, and sell your products.</p>
              <button className="read-more-btn-d6">Read More</button>
            </div>
            <div className="guide-card-d6">
              <div className="guide-icon-d6">
                <FaUser />
              </div>
              <h3 className="guide-title-d6">User Guide</h3>
              <p className="guide-description-d6">Understand how to browse, verify authenticity, and make purchases.</p>
              <button className="read-more-btn-d6">Read More</button>
            </div>
          </div>
        </div>

        {/* Shop Organic Products Section */}
        <div className="shop-section-d6">
          <h2 className="section-title-d6">Shop Organic Pesticides & Fertilizers</h2>
          <div className="products-container-d6">
            <div className="product-item-d6">
              <img src={organicCompost} alt="Organic Compost Plus" className="product-shop-image-d6" />
              <h3 className="product-shop-title-d6">Organic Compost Plus</h3>
              <button className="explore-products-btn-d6">Explore Products</button>
            </div>
            <div className="product-item-d6">
              <img src={naturalPestControl} alt="Natural Pest Control" className="product-shop-image-d6" />
              <h3 className="product-shop-title-d6">Natural Pest Control</h3>
              <button className="explore-products-btn-d6">Explore Products</button>
            </div>
            <div className="product-item-d6">
              <img src={soilEnricher} alt="Soil Enricher" className="product-shop-image-d6" />
              <h3 className="product-shop-title-d6">Soil Enricher</h3>
              <button className="explore-products-btn-d6">Explore Products</button>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="featured-products-d6">
          <h2 className="section-title-d6">Featured Products</h2>
          <div className="products-d6">
            <Link to="/products">
              <div className="product-card-d6">
                <img src={organicVegetables} alt="Organic Vegetables" className="product-image-d6" />
                <h3 className="product-title-d6">Organic Vegetables</h3>
                <p className="product-price-d6">₹249/kg</p>
                <button className="view-details-button-d6">View Details</button>
              </div>
            </Link>
            <div className="product-card-d6">
              <img src={freshFruits} alt="Fresh Fruits" className="product-image-d6" />
              <h3 className="product-title-d6">Organic Fruits</h3>
              <p className="product-price-d6">₹199/kg</p>
              <button className="view-details-button-d6">View Details</button>
            </div>
            <div className="product-card-d6">
              <img src={organicGrains} alt="Organic Grains" className="product-image-d6" />
              <h3 className="product-title-d6">Organic Grains</h3>
              <p className="product-price-d6">₹89/kg</p>
              <button className="view-details-button-d6">View Details</button>
            </div>
          </div>
        </div>

        {/* Recommended Farmers Section */}
        <div className="recommended-farmers-d6">
          <h2 className="section-title-d6">Recommended Farmers</h2>
          <div className="farmers-d6">
            <div className="farmer-card-d6">
              <img src={rajeshKumar} alt="Rajesh Kumar" className="farmer-image-d6" />
              <div className="farmer-info-d6">
                <h3 className="farmer-name-d6">Rajesh Kumar</h3>
                <p className="farmer-type-d6">Organic Farming</p>
                {renderStars(4)}
              </div>
              <MdVerifiedUser className="verified-icon-d6" />
            </div>
            <div className="farmer-card-d6">
              <img src={priyaSingh} alt="Priya Singh" className="farmer-image-d6" />
              <div className="farmer-info-d6">
                <h3 className="farmer-name-d6">Priya Singh</h3>
                <p className="farmer-type-d6">Vegetable Farming</p>
                {renderStars(3)}
              </div>
              <MdVerifiedUser className="verified-icon-d6" />
            </div>
            <div className="farmer-card-d6">
              <img src={amitPatel} alt="Amit Patel" className="farmer-image-d6" />
              <div className="farmer-info-d6">
                <h3 className="farmer-name-d6">Amit Patel</h3>
                <p className="farmer-type-d6">Sustainable Farming</p>
                {renderStars(5)}
              </div>
              <MdVerifiedUser className="verified-icon-d6" />
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-d6">
          <h2 className="section-title-d6">How It Works</h2>
          <div className="works-container-d6">
            <div className="works-column-d6">
              <h3 className="column-title-d6">For Farmers</h3>
              <div className="works-step-d6">
                <FaUserPlus className="step-icon-d6" />
                <div className="step-line-d6"></div>
                <FaCheck className="step-icon-d6" />
                <div className="step-line-d6"></div>
                <FaStore className="step-icon-d6" />
              </div>
              <p className="works-description-d6">Register → Get Verified → List Products</p>
            </div>
            <div className="works-column-d6">
              <h3 className="column-title-d6">For Consumers</h3>
              <div className="works-step-d6">
                <FaSearch className="step-icon-d6" />
                <div className="step-line-d6"></div>
                <IoDocumentTextOutline className="step-icon-d6" />
                <div className="step-line-d6"></div>
                <FaShoppingCart className="step-icon-d6" />
              </div>
              <p className="works-description-d6">Browse → Verify → Buy</p>
            </div>
          </div>
        </div>

        {/* Customer Testimonials Section */}
        <div className="testimonials-d6">
          <h2 className="section-title-d6">Customer Testimonials</h2>
          <div className="testimonials-container-d6">
            <div className="testimonial-card-d6">
              {renderStars(5)}
              <p className="testimonial-text-d6">"I can now directly sell to my customers as a verified farmer. The transparency in the system is commendable."</p>
              <div className="customer-info-d6">
                <img src={rajeshKumar} alt="Sarah Johnson" className="customer-image-d6" />
                <div className="customer-details-d6">
                  <h3 className="customer-name-d6">Sarah Johnson</h3>
                  <p className="customer-role-d6">Organic Farmer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card-d6">
              {renderStars(5)}
              <p className="testimonial-text-d6">"FarmTrust has given me complete confidence in the authenticity of the products."</p>
              <div className="customer-info-d6">
                <img src={priyaSingh} alt="Michael Chen" className="customer-image-d6" />
                <div className="customer-details-d6">
                  <h3 className="customer-name-d6">Michael Chen</h3>
                  <p className="customer-role-d6">Regular Customer</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card-d6">
              {renderStars(5)}
              <p className="testimonial-text-d6">"The quality of products and service are definitely recommend!"</p>
              <div className="customer-info-d6">
                <img src={amitPatel} alt="Emma Wilson" className="customer-image-d6" />
                <div className="customer-details-d6">
                  <h3 className="customer-name-d6">Emma Wilson</h3>
                  <p className="customer-role-d6">Happy Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Our Growing Community Section */}
        <div className="community-section-d6">
          <h2 className="community-title-d6">Join Our Growing Community</h2>
          <div className="community-buttons-d6">
            <button className="community-button-d6 register-farmer">Register as Farmer</button>
            <button className="community-button-d6 register-consumer">Register as Consumer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;