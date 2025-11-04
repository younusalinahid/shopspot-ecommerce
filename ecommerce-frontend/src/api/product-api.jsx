import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/products';

export const productService = {
    getProductsBySubCategory: async (subCategoryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/subCategory/${subCategoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    getRecentProducts: async (limit = 8) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent products:', error);
            throw error;
        }
    },

    getAllProducts: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    getProductById: async (productId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    searchProducts: async (query) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search?query=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
};