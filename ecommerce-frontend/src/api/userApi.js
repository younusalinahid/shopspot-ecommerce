import axios from "axios";

const BASE_URL = "http://localhost:8080/api/user/profile";

const authConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return { headers: { Authorization: `Bearer ${token}` } };
};

const formDataConfig = () => {
    const token = localStorage.getItem("token");
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
        const res = await axios.get(BASE_URL, authConfig());
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(BASE_URL, data, authConfig());
        return res.data;
    },

    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append("imageFile", imageFile);
        const res = await axios.put(`${BASE_URL}/image`, formData, formDataConfig());
        return res.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        await axios.put(`${BASE_URL}/change-password`,
            { currentPassword, newPassword },
            authConfig()
        );
    },
};