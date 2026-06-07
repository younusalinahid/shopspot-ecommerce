import axios from "axios";

const BASE_URL = "http://localhost:8080/api/admin/analytics";

const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const analyticsApi = {
    getAnalytics: async () => {
        const res = await axios.get(BASE_URL, authConfig());
        return res.data;
    },

    getMonthlyDetail: async (year, month) => {
        const res = await axios.get(`${BASE_URL}/monthly-detail`, {
            ...authConfig(),
            params: { year, month }
        });
        return res.data;
    }
};

