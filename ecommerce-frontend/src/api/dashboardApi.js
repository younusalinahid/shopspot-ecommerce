import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/dashboard";

const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const dashboardApi = {
    getDashboard: async () => {
        const res = await axios.get(BASE_URL, authConfig());
        return res.data;
    }
};