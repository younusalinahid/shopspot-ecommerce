import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const decodeTokenRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.roles && Array.isArray(payload.roles)) {
            const role = payload.roles[0];
            return role.replace('ROLE_', '');
        }

        if (payload.role) {
            return payload.role;
        }

        return "USER";
    } catch (e) {
        console.error("Error decoding token:", e);
        return "USER";
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, role, fullName } = response.data;

        if (!token) {
            throw new Error("No token received from server");
        }

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

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw new Error(error.message || "Registration failed");
    }
};

export const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    localStorage.removeItem("user");
};

export const isAuthenticated = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
    } catch (e) {
        return false;
    }
};

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

export const getToken = () => {
    return localStorage.getItem("jwtToken");
};

export const getUserRole = () => {
    return localStorage.getItem("role");
};

export const isAdmin = () => {
    const role = getUserRole();
    return role === "ADMIN";
};

export const hasRole = (requiredRole) => {
    const role = getUserRole();
    return role === requiredRole;
};

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

export const setupAxiosInterceptors = () => {
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

const handleLogin = async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);

    localStorage.setItem('token', response.data.token);
    sessionStorage.setItem('token', response.data.token);

    localStorage.setItem('user', JSON.stringify({
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role
    }));

    window.location.href = '/dashboard';
}

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