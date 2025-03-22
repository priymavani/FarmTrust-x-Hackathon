import axios from 'axios';

// Base URL for your backend API
const API_URL = 'http://localhost:5000'; // Adjust this if your backend runs on a different port or domain

// Axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // If your backend uses credentials (CORS)
});

// Fetch all products from the backend
export const getAllProducts = async () => {
  try {
    const response = await api.get('/farmers/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Let the caller handle the error
  }
};

export default api;