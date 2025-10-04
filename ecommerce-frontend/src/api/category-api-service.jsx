import axios from "axios";
import { getToken } from "./auth-api";

const API_URL = "http://localhost:8080/api/categories";

// Helper function to get headers with token
const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Get all categories with subcategories (PUBLIC - No Auth Required)
export const getAllCategories = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch categories" };
    }
};

// Get single category by ID (PUBLIC - No Auth Required)
export const getCategoryById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
};

// Create new category (ADMIN ONLY - Requires Auth)
export const createCategory = async (categoryData) => {
    try {
        const response = await axios.post(API_URL, categoryData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

// Update existing category (ADMIN ONLY - Requires Auth)
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, categoryData, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

// Delete category (ADMIN ONLY - Requires Auth)
export const deleteCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};

// Create subcategory under a category (ADMIN ONLY - Requires Auth)
export const createSubCategory = async (categoryId, subCategoryData) => {
    try {
        const response = await axios.post(
            `${API_URL}/${categoryId}/subcategories`,
            subCategoryData,
            {
                headers: getAuthHeaders()
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error;
    }
};

// Delete subcategory (ADMIN ONLY - Requires Auth)
export const deleteSubCategory = async (categoryId, subCategoryId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${categoryId}/subcategories/${subCategoryId}`,
            {
                headers: getAuthHeaders()
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        throw error;
    }
};