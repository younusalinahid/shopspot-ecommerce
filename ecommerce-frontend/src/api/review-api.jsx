import axiosInstance from "./axiosConfig";

export const addOrUpdateReview = (productId, reviewData) =>
    axiosInstance.post(`/api/user/reviews/product/${productId}`, reviewData);

export const getReviewsByProduct = (productId) =>
    axiosInstance.get(`/api/public/reviews/product/${productId}`);

export const getReviewSummary = (productId) =>
    axiosInstance.get(`/api/public/reviews/product/${productId}/summary`);

export const deleteReview = (reviewId) =>
    axiosInstance.delete(`/api/user/reviews/${reviewId}`);