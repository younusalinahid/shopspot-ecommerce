import axios from "axios";

import { ADMIN_URL } from "./config";

const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const analyticsApi = {
    getAnalytics: async () => {
        const res = await axios.get(`${ADMIN_URL}/analytics`, authConfig());
        return res.data;
    },

    getMonthlyDetail: async (year, month) => {
        const res = await axios.get(`${ADMIN_URL}/analytics/monthly-detail`, {
            ...authConfig(),
            params: { year, month }
        });
        return res.data;
    }
};

