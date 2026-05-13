import axios from "axios";
import { getToken } from "./auth-api";

const PUBLIC_API = "http://localhost:8080/api/public/banners";
const ADMIN_API = "http://localhost:8080/api/admin/banners";

const authConfig = () => {
    const token = getToken(); // FIXED
    if (!token) throw new Error("Not authenticated");

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getActiveBanners = async () => {
    try {
        const response = await axios.get(PUBLIC_API);
        return response.data;
    } catch (error) {
        console.error("Get active banners error:", error);
        return [];
    }
};

export const getAllBanners = async () => {
    try {
        const response = await axios.get(PUBLIC_API);
        return response.data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createBanner = async (bannerData) => {
    try {
        const response = await axios.post(ADMIN_API, bannerData, authConfig());
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createBannerWithFile = async (formData) => {
    try {
        const token = getToken();

        const response = await axios.post(`${ADMIN_API}/upload`, formData, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateBanner = async (id, bannerData) => {
    try {
        const response = await axios.put(`${ADMIN_API}/${id}`, bannerData, authConfig());
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const deleteBanner = async (id) => {
    try {
        const response = await axios.delete(`${ADMIN_API}/${id}`, authConfig());
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};