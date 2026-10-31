import axios from "axios";
import { ADMIN_URL, PUBLIC_URL } from "./config";

const authConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return { headers: { Authorization: `Bearer ${token}` } };
};

// The footer is on every page, so the public content is fetched once and shared.
let cached = null;

export const siteContentApi = {
    getPublicContent: () => {
        if (!cached) {
            cached = axios.get(`${PUBLIC_URL}/site-content`)
                .then(res => res.data)
                .catch(err => {
                    cached = null;
                    throw err;
                });
        }
        return cached;
    },

    clearCache: () => {
        cached = null;
    },

    getAdminContent: async () => {
        const res = await axios.get(`${ADMIN_URL}/site-content`, authConfig());
        return res.data;
    },

    updateSettings: async (settings) => {
        const res = await axios.put(`${ADMIN_URL}/site-content/settings`, settings, authConfig());
        cached = null;
        return res.data;
    },

    updatePage: async (slug, page) => {
        const res = await axios.put(`${ADMIN_URL}/site-content/pages/${slug}`, page, authConfig());
        cached = null;
        return res.data;
    },
};
