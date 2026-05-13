import axios from 'axios';

const PUBLIC_API = 'http://localhost:8080/api/public/auth';

const decodeTokenRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        if (payload.roles && Array.isArray(payload.roles)) {
            return payload.roles[0].replace('ROLE_', '');
        }

        if (payload.role) {
            return payload.role;
        }

        return "USER";
    } catch (e) {
        console.error("Token decode error:", e);
        return "USER";
    }
};

export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${PUBLIC_API}/register`, {
            fullName,
            email,
            password,
            confirmPassword: password
        });

        const {
            accessToken,
            refreshToken,
            userId,
            email: userEmail,
            fullName: userName,
            role
        } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id: userId,
            email: userEmail,
            fullName: userName,
            role: role || decodeTokenRole(accessToken)
        };

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", user.role);

        window.dispatchEvent(new Event('userLoggedIn'));

        return {
            success: true,
            token: accessToken,
            user
        };

    } catch (error) {
        console.error("Register error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Registration failed"
        };
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${PUBLIC_API}/login`, {
            email,
            password
        });

        const {
            accessToken,
            refreshToken,
            userId,
            email: userEmail,
            fullName,
            role
        } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id: userId,
            email: userEmail,
            fullName,
            role: role || decodeTokenRole(accessToken)
        };

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", user.role);

        window.dispatchEvent(new Event('userLoggedIn'));

        return {
            success: true,
            token: accessToken,
            user
        };

    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            error: error.response?.data?.message || "Login failed"
        };
    }
};

export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
            await axios.post(`${PUBLIC_API}/logout`, { refreshToken });
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");

        window.dispatchEvent(new Event('userLoggedOut'));
    }
};

export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${PUBLIC_API}/refresh`, {
            refreshToken
        });

        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);

        return {
            success: true,
            token: accessToken
        };

    } catch (error) {
        console.error("Refresh failed:", error);
        logout();
        return {
            success: false,
            error: "Session expired"
        };
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() < payload.exp * 1000;
    } catch {
        return false;
    }
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const getToken = () => {
    return localStorage.getItem("accessToken");
};

export const getUserRole = () => {
    const user = getCurrentUser();
    return user?.role || localStorage.getItem("role");
};

export const isAdmin = () => getUserRole() === "ADMIN";

export const hasRole = (role) => getUserRole() === role;

export const getUserFromToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        return {
            email: payload.sub,
            role: decodeTokenRole(token),
            exp: payload.exp,
            iat: payload.iat
        };
    } catch {
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