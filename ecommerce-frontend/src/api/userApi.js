import axios from "axios";

const PUBLIC_URL = "http://localhost:8080/api/user/profile";
const ADMIN_URL = "http://localhost:8080/api/admin/users";


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
        const res = await axios.get(PUBLIC_URL, authConfig());
        return res.data;
    },

    updateProfile: async (data) => {
        const res = await axios.put(PUBLIC_URL, data, authConfig());
        return res.data;
    },

    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append("imageFile", imageFile);
        const res = await axios.put(`${PUBLIC_URL}/image`, formData, formDataConfig());
        return res.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        await axios.put(`${PUBLIC_URL}/change-password`,
            { currentPassword, newPassword },
            authConfig()
        );
    },

    getAllUsers: async () => {
        const res = await axios.get(ADMIN_URL, authConfig());
        return res.data;
    },

    toggleStatus: async (id) => {
        await axios.put(`${ADMIN_URL}/${id}/toggle-status`, {}, authConfig());
    },
    deleteUser: async (id) => {
        await axios.delete(`${ADMIN_URL}/${id}`, authConfig());
    },

};