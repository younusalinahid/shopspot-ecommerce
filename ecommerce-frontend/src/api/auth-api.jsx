// src/api/auth-api.jsx
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

// Decode JWT token to extract role
const decodeTokenRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check for roles array in JWT
        if (payload.roles && Array.isArray(payload.roles)) {
            const role = payload.roles[0];
            return role.replace('ROLE_', '');
        }

        // Fallback to role field
        if (payload.role) {
            return payload.role;
        }

        return "USER"; // Default fallback
    } catch (e) {
        console.error("Error decoding token:", e);
        return "USER";
    }
};

// Login - Returns full user object
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, role, fullName } = response.data;

        if (!token) {
            throw new Error("No token received from server");
        }

        // Store all data in localStorage
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("fullName", fullName || email.split('@')[0]);
        localStorage.setItem("role", role || decodeTokenRole(token));

        return {
            token,
            email,
            role: role || decodeTokenRole(token),
            fullName: fullName || email.split('@')[0]
        };
    } catch (error) {
        console.error("Login error:", error);
        throw error.response?.data || { message: error.message || "Login failed" };
    }
};

// Register - Returns full user object
export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            fullName,
            email,
            password,
            confirmPassword: password // Backend expects this
        });

        const { token, role } = response.data;

        if (!token) {
            throw new Error("No token received from server");
        }

        // Store all data in localStorage
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("role", role || decodeTokenRole(token));

        return {
            token,
            email,
            role: role || decodeTokenRole(token),
            fullName
        };
    } catch (error) {
        console.error("Registration error:", error);

        // Handle specific error messages from backend
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw new Error(error.message || "Registration failed");
    }
};

// Logout - Clear all stored data
export const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("user");
};

// Check if user is authenticated with token expiry check
export const isAuthenticated = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return false;

    // Check if token is expired
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
    } catch (e) {
        return false;
    }
};

// Get current user from localStorage
export const getCurrentUser = () => {
    const email = localStorage.getItem("userEmail");
    const fullName = localStorage.getItem("fullName");
    const role = localStorage.getItem("role");

    if (email) {
        return {
            email,
            fullName: fullName || email.split('@')[0],
            username: email.split('@')[0],
            role
        };
    }
    return null;
};

// Get token
export const getToken = () => {
    return localStorage.getItem("jwtToken");
};

// Get user role (IMPORTANT for ProtectedRoute)
export const getUserRole = () => {
    return localStorage.getItem("role");
};

// Check if user is admin
export const isAdmin = () => {
    const role = getUserRole();
    return role === "ADMIN";
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
    const role = getUserRole();
    return role === requiredRole;
};

// Get full user info from token
export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub || payload.email,
            role: decodeTokenRole(token),
            exp: payload.exp,
            iat: payload.iat
        };
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
};

// Setup Axios interceptors (MUST call this in App.js)
export const setupAxiosInterceptors = () => {
    // Request interceptor - Add token to all requests automatically
    axios.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - Handle 401 errors automatically
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                logout();
                window.location.href = '/';
                alert("Session expired. Please login again.");
            }
            return Promise.reject(error);
        }
    );
};

export const axiosWithAuth = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
});

// Export everything
export default {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    getToken,
    getUserRole,
    isAdmin,
    hasRole,
    getUserFromToken,
    setupAxiosInterceptors
};