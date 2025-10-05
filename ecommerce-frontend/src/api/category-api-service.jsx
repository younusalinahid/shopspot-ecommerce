import { axiosWithAuth } from "./auth-api";
import axios from "axios";

// Public APIs - no auth needed
export const getAllCategories = async () => {
    const response = await axios.get("http://localhost:8080/api/categories");
    return response.data;
};

export const getCategoryById = async (id) => {
    const response = await axios.get(`http://localhost:8080/api/categories/${id}`);
    return response.data;
};

// Admin APIs - auth token required
export const createCategory = async (category) => {
    const response = await axiosWithAuth.post("/api/categories", category);
    return response.data;
};

export const updateCategory = async (id, category) => {
    const response = await axiosWithAuth.put(`/api/categories/${id}`, category);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axiosWithAuth.delete(`/api/categories/${id}`);
    return response.data;
};

// Subcategory APIs
export const createSubCategory = async (categoryId, subCategory) => {
    const response = await axiosWithAuth.post(`/api/categories/${categoryId}/subcategories`, subCategory);
    return response.data;
};
