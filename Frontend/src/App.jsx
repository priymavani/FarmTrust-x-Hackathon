import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import ProductList from './components/Product/ProductList';
import SingleProduct from './components/SingleProduct/SingleProduct';


function App() {
  

  return (
    <Router>
      <Routes>    
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:productId" element={<SingleProduct />} />
      </Routes>
    </Router>
  );
}

export default App;
