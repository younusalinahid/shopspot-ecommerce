import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed"};
    }
};

export const register = async (fullName, email, password, confirmPassword) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            fullName,
            email,
            password,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || {message: "Registration failed"};
    }
};