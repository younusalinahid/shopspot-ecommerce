import axios from 'axios';
import {toast} from "react-toastify";

const API_BASE_URL = 'http://localhost:8080/api/products';

const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
    };
};

const getFormDataConfig = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
    };
};

export const productService = {
    // Existing methods
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
            const response = await axios.get(API_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    getAllProductsWithCategoryAndSubCategory: async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/with-category`);
            return res.data;
        } catch (err) {
            toast.error("Failed to fetch products");
            throw err;
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
    },

    // New Admin methods
    createProduct: async (productData) => {
        try {
            const formData = new FormData();
            formData.append("name", productData.name);
            formData.append("description", productData.description || "");
            formData.append("price", Number(productData.price));
            formData.append("subCategoryId", Number(productData.subCategoryId));

            if (productData.images && productData.images.length > 0) {
                formData.append("imageFile", productData.images[0]);
            }

            const response = await axios.post(API_BASE_URL, formData, getFormDataConfig());
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    updateProduct: async (productId, productData) => {
        try {
            const formData = new FormData();
            formData.append("name", productData.name);
            formData.append("description", productData.description || "");
            formData.append("price", Number(productData.price));
            formData.append("subCategoryId", Number(productData.subCategoryId));

            if (productData.images && productData.images.length > 0) {
                formData.append("imageFile", productData.images[0]);
            }

            const response = await axios.put(
                `${API_BASE_URL}/${productId}`,
                formData,
                getFormDataConfig()
            );
            return response.data;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    deleteProduct: async (productId) => {
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/${productId}`,
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }
};