import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` })
        }
    };
};

export const categoryApi = {

    getAllCategories: async () => {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        return response.data;
    },

    getCategoryById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
        return response.data;
    },

    createCategory: async (category) => {
        const response = await axios.post(
            `${API_BASE_URL}/categories`,
            category,
            getAuthConfig()
        );
        return response.data;
    },

    updateCategory: async (id, category) => {
        const response = await axios.put(
            `${API_BASE_URL}/categories/${id}`,
            category,
            getAuthConfig()
        );
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await axios.delete(
            `${API_BASE_URL}/categories/${id}`,
            getAuthConfig()
        );
        return response.data;
    },

    createSubCategory: async (categoryId, subCategory) => {
        const response = await axios.post(
            `${API_BASE_URL}/categories/${categoryId}/subcategories`,
            subCategory,
            getAuthConfig()
        );
        return response.data;
    },

    getSubCategoryWithProducts: async (subCategoryId) => {
        const response = await axios.get(
            `${API_BASE_URL}/subCategories/${subCategoryId}`,
            getAuthConfig()
        );
        return response.data;
    }
};
