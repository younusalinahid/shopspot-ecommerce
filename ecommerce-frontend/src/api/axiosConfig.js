import axios from 'axios';
import { BASE_URL } from "./config";
import { refreshToken as refreshTokenAPI, clearSession, isAccessTokenValid } from './authApi';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const PROTECTED_PAGES = ['/orders', '/profile', '/user', '/admin'];

const isAuthCall = (url = '') =>
    url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');

const isPublicCall = (url = '') => url.includes('/api/public/');

const getStoredToken = () =>
    localStorage.getItem('token') || localStorage.getItem('accessToken');

/** Ends the session; sends the user to login only if they are on a page that needs it. */
const handleSessionExpired = () => {
    clearSession();
    const path = window.location.pathname;
    if (PROTECTED_PAGES.some((p) => path.startsWith(p))) {
        sessionStorage.setItem('intendedPath', path);
        window.location.href = '/login';
    }
};

// ── Request: attach a valid token, refreshing it first if it has expired ──
axiosInstance.interceptors.request.use(
    async (config) => {
        let token = getStoredToken();

        if (token && !isAuthCall(config.url) && !isAccessTokenValid()) {
            const result = await refreshTokenAPI();
            if (result.success) {
                token = result.token;
            } else {
                token = null;
                if (result.expired) handleSessionExpired();
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response: on 401 try one refresh, and never let a stale token break public pages ──
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry
            || isAuthCall(originalRequest.url)) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;

        if (localStorage.getItem('refreshToken')) {
            const result = await refreshTokenAPI();
            if (result.success) {
                originalRequest.headers.Authorization = `Bearer ${result.token}`;
                return axiosInstance(originalRequest);
            }
            if (result.expired) handleSessionExpired();
        } else if (getStoredToken()) {
            handleSessionExpired();
        }

        // Public endpoints work without login, so retry them anonymously
        if (isPublicCall(originalRequest.url)) {
            delete originalRequest.headers.Authorization;
            return axiosInstance(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
