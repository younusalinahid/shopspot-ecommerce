import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

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
        const response = await axios.post("/api/categories", category);
        return response.data;
    },

    updateCategory: async (id, category) => {
        const response = await axios.put(`/api/categories/${id}`, category);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await axios.delete(`/api/categories/${id}`);
        return response.data;
    },

    createSubCategory: async (categoryId, subCategory) => {
        const response = await axios.post(`/api/categories/${categoryId}/subcategories`, subCategory);
        return response.data;
    },

    getSubCategoryWithProducts: async (subCategoryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/subCategories/${subCategoryId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subcategory with products:', error);
            throw error;
        }
    }
};
