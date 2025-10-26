import axios from "axios";
import { getToken } from "./auth-api";

const API_URL = "http://localhost:8080/api/banners";

const getAuthHeaders = () => {
    const token = getToken();

    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const getActiveBanners = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch banners" };
    }
};

export const getAllBanners = async () => {
    try {

        const response = await axios.get(`${API_URL}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBanner = async (bannerData) => {
    try {
        const response = await axios.post(API_URL, bannerData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createBannerWithFile = async (formData) => {
    try {
        const token = getToken();

        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateBanner = async (id, bannerData) => {
    try {

        const response = await axios.put(`${API_URL}/${id}`, bannerData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBanner = async (id) => {
    try {

        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};