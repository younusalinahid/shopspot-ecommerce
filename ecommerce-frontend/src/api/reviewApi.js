import axiosInstance from "./axiosConfig";

export const addOrUpdateReview = (productId, reviewData) =>
    axiosInstance.post(`/api/user/reviews/product/${productId}`, reviewData);

export const getReviewsByProduct = (productId) =>
    axiosInstance.get(`/api/public/reviews/product/${productId}`);

export const getReviewSummary = (productId) =>
    axiosInstance.get(`/api/public/reviews/product/${productId}/summary`);

export const deleteReview = (reviewId) =>
    axiosInstance.delete(`/api/user/reviews/${reviewId}`);

export const canUserReview = async (productId) => {
    try {
        const res = await axiosInstance.get(
            `/api/user/reviews/product/${productId}/can-review`
        );
        return res.data.canReview;
    } catch {
        return false;
    }
};

export const getProductSentiment = async (productId) => {
    try {
        const res = await axiosInstance.get(
            `/api/public/reviews/product/${productId}/sentiment`
        );
        return res.data;
    } catch (err) {
        console.error("Sentiment fetch error:", err);
        return null;
    }
};