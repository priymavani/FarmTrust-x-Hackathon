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

export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/farmers/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        throw error;
    }
};

export const getUserByEmail = async (email) => {
    try {
        const response = await api.get(`/users/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error.response?.data?.message || 'Failed to fetch user';
    }
};

export const getFarmerByEmail = async (email, token) => {
    try {
        const response = await fetch(`${API_URL}/farmers/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Include token if route is protected
            },
        });
        if (!response.ok) throw new Error('Failed to fetch farmer');
        const data = await response.json();
        return data.farmer; // Return the farmer object
    } catch (error) {
        return;
    }
};

export const updateUser = async (id, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error('Failed to update user');
        const data = await response.json();
        return data.user; // Return the updated user object
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const getAllOrders = async (token) => {
    try {
        const response = await api.get('/orders', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.orders; // Return the 'orders' array from { message, orders }
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error.response?.data?.message || 'Failed to fetch orders';
    }
};

export const updateFarmer = async (email, updatedData, token) => {
    try {
        const response = await fetch(`${API_URL}/farmers/${email}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: updatedData, // FormData, no Content-Type header needed
        });
        if (!response.ok) throw new Error('Failed to update farmer');
        const data = await response.json();
        return data.farmer;
    } catch (error) {
        console.error('Error updating farmer:', error);
        throw error;
    }
};

export default api;