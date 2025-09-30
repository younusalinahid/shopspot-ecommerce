import axios from "axios";

const API_URL = "http://localhost:8080/api/categories";

export const fetchCategory = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories: ", error);
        throw error;
    }


    // export const getCategories = () => axios.get(API_URL);
    // export const getCategoryById = (id) => axios.get(`${API_URL}/${id}`);
    // export const createCategory = (data) => axios.post(API_URL, data);
    // export const updateCategory = (id, data) => axios.put(`${API_URL}/${id}`, data);
    // export const deleteCategory = (id) => axios.delete(`${API_URL}/${id}`);
    // export const createSubCategory = (categoryId, data) =>
    //     axios.post(`${API_URL}/${categoryId}/subcategories`, data);

}