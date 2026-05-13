import axios from "axios";

const PUBLIC_URL = "http://localhost:8080/api/public";
const ADMIN_URL = "http://localhost:8080/api/admin";

const authConfig = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const categoryApi = {

    getAllCategories: async () => {
        const res = await axios.get(`${PUBLIC_URL}/categories`);
        return res.data;
    },

    getCategoryById: async (id) => {
        const res = await axios.get(`${PUBLIC_URL}/categories/${id}`);
        return res.data;
    },

    getCategoriesWithProducts: async (productsPerCategory = 4) => {
        const res = await axios.get(`${PUBLIC_URL}/categories/with-products`, {
            params: { productsPerCategory }
        });
        return res.data;
    },

    getProductsByCategory: async (categoryId) => {
        const res = await axios.get(`${PUBLIC_URL}/categories/${categoryId}/products`);
        return res.data;
    },

    createCategory: async (category) => {
        const res = await axios.post(`${ADMIN_URL}/categories`, category, authConfig());
        return res.data;
    },

    updateCategory: async (id, category) => {
        const res = await axios.put(`${ADMIN_URL}/categories/${id}`, category, authConfig());
        return res.data;
    },

    deleteCategory: async (id) => {
        await axios.delete(`${ADMIN_URL}/categories/${id}`, authConfig());
    },

    createSubCategory: async (categoryId, subCategory) => {
        const res = await axios.post(
            `${ADMIN_URL}/categories/${categoryId}/subcategories`,
            subCategory,
            authConfig()
        );
        return res.data;
    },
};

export const subCategoryApi = {

    getAllSubCategories: async () => {
        const res = await axios.get(`${PUBLIC_URL}/subCategories`);
        return res.data;
    },

    getSubCategoryById: async (id) => {
        const res = await axios.get(`${PUBLIC_URL}/subCategories/${id}`);
        return res.data;
    },

    updateSubCategory: async (id, subCategory) => {
        const res = await axios.put(
            `${ADMIN_URL}/subCategories/${id}`,
            subCategory,
            authConfig()
        );
        return res.data;
    },

    deleteSubCategory: async (id) => {
        await axios.delete(`${ADMIN_URL}/subCategories/${id}`, authConfig());
    },
};