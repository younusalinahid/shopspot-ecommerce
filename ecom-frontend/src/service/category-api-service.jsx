import axios from "axios";

const API_URL = "http://localhost:8080/api/categories"; // backend URL

export const fetchCategory = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories: ", error);
        throw error;
    }
}