import axiosInstance from "./axiosConfig";

export const recommendationApi = {
    getRecommendations: async () => {
        const res = await axiosInstance.get("/api/user/recommendations");
        return res.data;
    }
};