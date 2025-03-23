import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage/LandingPage';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductList from './components/Product/ProductList';
import SingleProduct from './components/SingleProduct/SingleProduct';
import FarmerProfile from './components/FarmerProfile/FarmerProfile';
import Farmer from './components/Farmer';
import UserDashboard from './UserDashboard';
import FarmerApplyForm from './components/FarmerApplyForm/FarmerApplyForm';
import Chatbot from './components/ChatBot/ChatBot.jsx';



function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isFarmerDashboard = location.pathname.startsWith("/farmerpanel");

  return (
    <>
      {!isFarmerDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={< LandingPage />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:productId" element={<SingleProduct />} />
        <Route path="/farmer/:email" element={<FarmerProfile />} />
        <Route path="/farmerpanel/*" element={<Farmer />} />
        <Route path="/user/*" element={<UserDashboard />} />
        <Route path="/farmer-application" element={<FarmerApplyForm />} />
      </Routes>
      <Chatbot/>
      <Footer />
    </>
  );
}

export default App;
