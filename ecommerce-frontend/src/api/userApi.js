import axios from "axios";
import {PUBLIC_URL, ADMIN_URL, USER_URL} from "./config";

const PROFILE_URL = `${USER_URL}/profile`;
const ADMIN_USERS_URL = `${ADMIN_URL}/users`;

const authConfig = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Not authenticated");
    return {headers: {Authorization: `Bearer ${token}`}};
};

const formDataConfig = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) throw new Error("Not authenticated");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    };
};

export const userApi = {

    getProfile: async () => {
        const res = await axios.get(PROFILE_URL, authConfig());
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(PROFILE_URL, data, authConfig());
        return res.data;
    },

    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append("imageFile", imageFile);
        const res = await axios.put(`${PROFILE_URL}/image`, formData, formDataConfig());
        return res.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        await axios.put(`${PROFILE_URL}/change-password`,
            {currentPassword, newPassword},
            authConfig()
        );
    },

    getAllUsers: async () => {
        const res = await axios.get(ADMIN_USERS_URL, authConfig());
        return res.data;
    },

    toggleStatus: async (id) => {
        await axios.put(`${ADMIN_USERS_URL}/${id}/toggle-status`, {}, authConfig());
    },
    deleteUser: async (id) => {
        await axios.delete(`${ADMIN_USERS_URL}/${id}`, authConfig());
    },

    sendReport: async (reportData) => {
        const response = await axios.post(`${PUBLIC_URL}/report`, reportData);
        return response.data;
    }
};