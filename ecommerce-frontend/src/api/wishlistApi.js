import axios from "axios";

const BASE_URL = "http://localhost:8080/api/user/wishlist";

const authConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const wishlistApi = {

    getWishlist: async () => {
        const res = await axios.get(BASE_URL, authConfig());
        return res.data;
    },

    toggleWishlist: async (productId) => {
        const res = await axios.post(`${BASE_URL}/${productId}/toggle`, {}, authConfig());
        return res.data;
    },

    getStatus: async (productId) => {
        const res = await axios.get(`${BASE_URL}/${productId}/status`, authConfig());
        return res.data;
    },
};