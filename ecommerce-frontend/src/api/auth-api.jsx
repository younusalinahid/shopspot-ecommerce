import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

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

// Register new user
export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, {
            fullName,
            email,
            password,
            confirmPassword: password
        });

        // ✅ Backend returns: { accessToken, refreshToken, role, userId, email, fullName }
        const { accessToken, refreshToken, role, userId, email: userEmail, fullName: userName } = response.data;

        if (!accessToken) {
            throw new Error("No token received from server");
        }

        // Build user object
        const user = {
            id: userId,
            email: userEmail || email,
            fullName: userName || fullName,
            role: role || decodeTokenRole(accessToken)
        };

        // Save everything to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("fullName", user.fullName);
        localStorage.setItem("role", user.role);

        // Dispatch login event
        window.dispatchEvent(new Event('userLoggedIn'));

        return {
            success: true,
            token: accessToken,
            user
        };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Registration failed"
        };
    }
};

// Login user
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, {
            email,
            password
        });

        // ✅ Backend returns: { token, email, fullName, role, userId }
        const { token, email: userEmail, fullName, role, userId } = response.data;

        if (!token) {
            throw new Error("No token received from server");
        }

        // Build user object
        const user = {
            id: userId,
            email: userEmail || email,
            fullName: fullName,
            role: role || decodeTokenRole(token)
        };

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("fullName", user.fullName);
        localStorage.setItem("role", user.role);

        // Dispatch login event
        window.dispatchEvent(new Event('userLoggedIn'));

        return {
            success: true,
            token,
            user
        };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || "Login failed"
        };
    }
};

// Logout user
export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            await axios.post(`${API_BASE_URL}/logout`, { refreshToken });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear all localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("fullName");
        localStorage.removeItem("role");

        // Dispatch logout event
        window.dispatchEvent(new Event('userLoggedOut'));
    }
};

// Refresh access token
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/refresh`, {
            refreshToken: refreshToken
        });

        const { accessToken, userId, email, fullName, role } = response.data;

        // Update tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('token', accessToken);

        // Update user info if provided
        if (userId) {
            const user = {
                id: userId,
                email: email,
                fullName: fullName,
                role: role
            };
            localStorage.setItem('user', JSON.stringify(user));
        }

        return {
            success: true,
            token: accessToken
        };
    } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
        return {
            success: false,
            error: 'Session expired'
        };
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() < exp;
    } catch (e) {
        return false;
    }
};

// Get current user
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Error parsing user:", e);
        }
    }

    // Fallback to old method
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

// Get auth token
export const getToken = () => {
    return localStorage.getItem("accessToken") || localStorage.getItem("token");
};

// Get user role
export const getUserRole = () => {
    const user = getCurrentUser();
    return user?.role || localStorage.getItem("role");
};

// Check if admin
export const isAdmin = () => {
    const role = getUserRole();
    return role === "ADMIN";
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
    const role = getUserRole();
    return role === requiredRole;
};

// Get user from token
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

export default {
    register,
    login,
    logout,
    refreshToken,
    isAuthenticated,
    getCurrentUser,
    getToken,
    getUserRole,
    isAdmin,
    hasRole,
    getUserFromToken
};