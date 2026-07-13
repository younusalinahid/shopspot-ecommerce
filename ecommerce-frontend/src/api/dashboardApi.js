import axios from "axios";

import {ADMIN_URL} from "./config";

const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

export const dashboardApi = {
    getDashboard: async () => {
        const res = await axios.get(ADMIN_URL, authConfig());
        return res.data;
    }
};