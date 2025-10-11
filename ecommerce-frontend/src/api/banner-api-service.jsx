// src/api/banner-api-service.jsx
import axios from "axios";
import { getToken } from "./auth-api";

const API_URL = "http://localhost:8080/api/banners";

// Helper function to get headers with token
const getAuthHeaders = () => {
    const token = getToken();
    console.log('Token for request:', token ? 'Present' : 'Missing');
    console.log('Token value:', token);

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Get active banners (PUBLIC - No Auth Required)
export const getActiveBanners = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching active banners:", error);
        throw error.response?.data || { message: "Failed to fetch banners" };
    }
};

// Get all banners (ADMIN ONLY - Requires Auth)
export const getAllBanners = async () => {
    try {
        console.log('Fetching all banners...');
        console.log('Headers:', getAuthHeaders());

        const response = await axios.get(`${API_URL}/allBanners`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching all banners:", error);
        console.error("Response:", error.response);
        throw error;
    }
};

// Create new banner (ADMIN ONLY - Requires Auth)
export const createBanner = async (bannerData) => {
    try {
        console.log('Creating banner with data:', bannerData);
        console.log('Request headers:', getAuthHeaders());

        const response = await axios.post(API_URL, bannerData, {
            headers: getAuthHeaders()
        });

        console.log('Create response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating banner:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        throw error;
    }
};

// Create banner with file upload (ADMIN ONLY - Requires Auth)
export const createBannerWithFile = async (formData) => {
    try {
        const token = getToken();
        console.log('Creating banner with file upload');
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });

        console.log('Upload response:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading banner:", error);
        console.error("Error response:", error.response);
        throw error;
    }
};

// Update existing banner (ADMIN ONLY - Requires Auth)
export const updateBanner = async (id, bannerData) => {
    try {
        console.log('Updating banner:', id, bannerData);
        console.log('Request headers:', getAuthHeaders());

        const response = await axios.put(`${API_URL}/${id}`, bannerData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error updating banner:", error);
        console.error("Error response:", error.response);
        throw error;
    }
};

// Delete banner (ADMIN ONLY - Requires Auth)
export const deleteBanner = async (id) => {
    try {
        console.log('Deleting banner:', id);
        console.log('Request headers:', getAuthHeaders());

        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting banner:", error);
        console.error("Error response:", error.response);
        throw error;
    }
};