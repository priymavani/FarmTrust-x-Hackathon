import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage/LandingPage';
import Navbar from './Navbar';
import Footer from './Footer';

// import ProductList from './components/Product/ProductList';
import { useState } from 'react';
import ProductList from './components/Product/ProductList';
import SingleProduct from './components/SingleProduct/SingleProduct';


function App() {
  

  return (
    <Router>
      <Navbar />
      <Routes>    
        {/* <Route path="/products" element={<ProductList />} /> */}
        <Route path="/" element={< LandingPage/>} />

        <Route path="/products" element={<ProductList />} />
        <Route path="/product" element={<SingleProduct />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
