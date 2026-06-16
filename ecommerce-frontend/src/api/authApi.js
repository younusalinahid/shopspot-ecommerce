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

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${PUBLIC_API}/login`, { email, password });
        const { accessToken, refreshToken, userId, email: userEmail,
            fullName, role, active } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id:       userId,
            email:    userEmail,
            fullName,
            role:     role || decodeTokenRole(accessToken),
            active:   active ?? true,
            phone:    null,
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        window.dispatchEvent(new Event('userLoggedIn'));
        window.dispatchEvent(new StorageEvent('storage'));

        return { success: true, token: accessToken, user };
    } catch (err) {
        const backendMsg = err.response?.data?.message || err.message || "";
        return { success: false, error: backendMsg || "Invalid email or password" };
    }
};

export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${PUBLIC_API}/register`, {
            fullName, email, password, confirmPassword: password
        });
        const { accessToken, refreshToken, userId,
            email: userEmail, fullName: userName, role } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id:       userId,
            email:    userEmail,
            fullName: userName,
            role:     role || decodeTokenRole(accessToken),
            active:   true,
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        window.dispatchEvent(new Event('userLoggedIn'));
        window.dispatchEvent(new StorageEvent('storage'));

        return { success: true, token: accessToken, user };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || "Registration failed"
        };
    }
};

export const logout = async () => {
    try {
        const storedRefresh = localStorage.getItem('refreshToken');
        if (storedRefresh) {
            await axios.post(`${PUBLIC_API}/logout`, { refreshToken: storedRefresh });
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.dispatchEvent(new Event('userLoggedOut'));
        window.dispatchEvent(new StorageEvent('storage'));
    }
};

export const refreshToken = async () => {
    try {
        const stored = localStorage.getItem('refreshToken');
        if (!stored) throw new Error("No refresh token");

        const response = await axios.post(`${PUBLIC_API}/refresh`, {
            refreshToken: stored
        });

        const { accessToken } = response.data;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);

        return { success: true, token: accessToken };
    } catch (error) {
        return { success: false, error: "Session expired" };
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
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