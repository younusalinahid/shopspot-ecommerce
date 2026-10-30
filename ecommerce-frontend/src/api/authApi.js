import axios from 'axios';
import { PUBLIC_URL } from "./config";

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
        const response = await axios.post(`${PUBLIC_URL}/auth/login`, { email, password });
        const {
            accessToken, refreshToken, userId, email: userEmail,
            fullName, role, active
        } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id: userId,
            email: userEmail,
            fullName,
            role: role || decodeTokenRole(accessToken),
            active: active ?? true,
            phone: null,
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        window.dispatchEvent(new Event('userLoggedIn'));
        window.dispatchEvent(new StorageEvent('storage'));

        return { success: true, token: accessToken, user };
    } catch (err) {
        const backendMsg = err.response?.data?.message || err.response?.data?.error || err.message || "";
        return { success: false, error: backendMsg || "Invalid email or password" };
    }
};

export const register = async (fullName, email, password) => {
    try {
        const response = await axios.post(`${PUBLIC_URL}/auth/register`, {
            fullName, email, password, confirmPassword: password
        });
        const {
            accessToken, refreshToken, userId,
            email: userEmail, fullName: userName, role
        } = response.data;

        if (!accessToken) throw new Error("No access token received");

        const user = {
            id: userId,
            email: userEmail,
            fullName: userName,
            role: role || decodeTokenRole(accessToken),
            active: true,
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);  // MUST
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
        const accessToken = localStorage.getItem('token');

        if (storedRefresh) {
            await axios.post(
                `${PUBLIC_URL}/auth/logout`,
                { refreshToken: storedRefresh },
                {
                    headers: accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {}
                }
            );
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        clearSession();
    }
};

const SESSION_KEYS = ["token", "accessToken", "refreshToken", "user", "role"];

/** Removes the login session from this browser (guest cart is kept). */
export const clearSession = () => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new Event('userLoggedOut'));
    window.dispatchEvent(new StorageEvent('storage'));
};

/** True when the stored access token exists and is not about to expire. */
export const isAccessTokenValid = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Refresh 30 seconds early so a request never goes out with a token that expires on the way
        return Date.now() < payload.exp * 1000 - 30000;
    } catch {
        return false;
    }
};

let refreshInFlight = null;

/**
 * Gets a new access token with the stored refresh token.
 * Concurrent callers share one request, so the refresh token is rotated only once.
 * Result: { success, token } or { success: false, expired } where expired=true means
 * the session is really over (not just a network problem).
 */
export const refreshToken = async () => {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const stored = localStorage.getItem('refreshToken');
        if (!stored) return { success: false, expired: true, error: "No refresh token" };

        try {
            const response = await axios.post(`${PUBLIC_URL}/auth/refresh`, {
                refreshToken: stored
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            if (!accessToken) throw new Error("No access token in refresh response");

            localStorage.setItem("token", accessToken);
            localStorage.setItem("accessToken", accessToken);
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            return { success: true, token: accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            // Another tab may have rotated the refresh token at the same moment.
            const latest = localStorage.getItem('refreshToken');
            if (latest && latest !== stored && isAccessTokenValid()) {
                return { success: true, token: localStorage.getItem("token") };
            }
            const status = error.response?.status;
            return {
                success: false,
                expired: status === 401 || status === 400,
                error: "Session expired"
            };
        }
    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
};

/**
 * Logged in = valid access token, or a refresh token that can renew it.
 * This keeps users signed in after the 24h access token expires.
 */
export const isAuthenticated = () => {
    return isAccessTokenValid() || !!localStorage.getItem("refreshToken");
};

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

export const getToken = () => {
    return localStorage.getItem("token");
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
    clearSession,
    isAccessTokenValid,
    isAuthenticated,
    getCurrentUser,
    getToken,
    getUserRole,
    isAdmin,
    hasRole,
    getUserFromToken
};