import React, { useState, useEffect } from 'react';
import './ProductList.css';

const ProductList = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('Newest');
  const [displayedProducts, setDisplayedProducts] = useState([]);

  // Product data
  const products = [
    {
      id: 1,
      name: 'Organic Carrots',
      category: 'Vegetables',
      price: 120,
      unit: 'kg',
      rating: 4,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?q=80&w=400'
    },
    {
      id: 2,
      name: 'Fresh Apples',
      category: 'Fruits',
      price: 180,
      unit: 'kg',
      rating: 5,
      reviews: 136,
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400'
    },
    {
      id: 3,
      name: 'Brown Rice',
      category: 'Grains',
      price: 90,
      unit: 'kg',
      rating: 4,
      reviews: 118,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=400'
    },
    {
      id: 4,
      name: 'Organic Milk',
      category: 'Other',
      price: 60,
      unit: 'L',
      rating: 5,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400'
    },
    // Duplicate products to match the layout in the image
    {
      id: 5,
      name: 'Organic Carrots',
      category: 'Vegetables',
      price: 120,
      unit: 'kg',
      rating: 4,
      reviews: 24,
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?q=80&w=400'
    },
    {
      id: 6,
      name: 'Fresh Apples',
      category: 'Fruits',
      price: 180,
      unit: 'kg',
      rating: 5,
      reviews: 136,
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400'
    },
    {
      id: 7,
      name: 'Brown Rice',
      category: 'Grains',
      price: 90,
      unit: 'kg',
      rating: 4,
      reviews: 118,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=400'
    },
    {
      id: 8,
      name: 'Organic Milk',
      category: 'Other',
      price: 60,
      unit: 'L',
      rating: 5,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400'
    }
  ];

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Filter and sort products when dependencies change
  useEffect(() => {
    // First, filter by category
    let filtered = activeCategory === 'All' 
      ? [...products] 
      : products.filter(product => product.category === activeCategory);
    
    // Then, filter by price
    filtered = filtered.filter(product => product.price <= priceRange);
    
    // Finally, sort the products
    switch(sortBy) {
      case 'Price: Low to High':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Newest':
      default:
        // For demo purposes, we'll just keep the original order for "Newest"
        break;
    }
    
    setDisplayedProducts(filtered);
  }, [activeCategory, priceRange, sortBy]);

  return (
    <div className="product-container">
      <h1>Explore Natural Products</h1>
      
      {/* Category Filters with All button */}
      <div className="category-filters">
        <button 
          className={activeCategory === 'All' ? 'active' : ''} 
          onClick={() => setActiveCategory('All')}
        >
          All
        </button>
        <button 
          className={activeCategory === 'Vegetables' ? 'active' : ''} 
          onClick={() => setActiveCategory('Vegetables')}
        >
          Vegetables
        </button>
        <button 
          className={activeCategory === 'Fruits' ? 'active' : ''} 
          onClick={() => setActiveCategory('Fruits')}
        >
          Fruits
        </button>
        <button 
          className={activeCategory === 'Grains' ? 'active' : ''} 
          onClick={() => setActiveCategory('Grains')}
        >
          Grains
        </button>
      </div>
      
      {/* Price Range and Sort */}
      <div className="filter-controls">
        <div className="price-range">
          <span>Price Range:</span>
          <input 
            type="range" 
            min="0" 
            max="500" 
            value={priceRange} 
            onChange={(e) => setPriceRange(parseInt(e.target.value))} 
          />
          <span>₹0 - ₹{priceRange}</span>
        </div>
        
        <div className="sort-by">
          <label>Sort by: </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Rating">Rating</option>
          </select>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="products-grid">
        {displayedProducts.map(product => (
          <div className="product-card" key={product.id}>
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-details">
              <h3>{product.name}</h3>
              <div className="rating">
                {renderStars(product.rating)}
                <span className="reviews">({product.reviews} reviews)</span>
              </div>
              <div className="price-action">
                <span className="price">₹{product.price}/{product.unit}</span>
                <button className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Message when no products match */}
      {displayedProducts.length === 0 && (
        <div className="no-products-message">
          No products match your current filters. Try adjusting your price range or category.
        </div>
      )}
    </div>
  );
};

export default ProductList;