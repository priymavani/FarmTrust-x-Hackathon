import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage/LandingPage';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductList from './components/Product/ProductList';
import SingleProduct from './components/SingleProduct/SingleProduct';
import FarmerProfile from './components/FarmerProfile/FarmerProfile';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>    
        {/* <Route path="/products" element={<ProductList />} /> */}
        <Route path="/" element={< LandingPage/>} />

        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:productId" element={<SingleProduct />} />
        <Route path="/product" element={<SingleProduct />} />
        <Route path="/farmer" element={<FarmerProfile />} />
        
        <Route path="/sidebar" element={<Sidebar />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
