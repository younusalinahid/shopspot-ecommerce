import axios from 'axios';
import { BASE_URL } from "./config";
import { refreshToken as refreshTokenAPI } from './authApi';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwtToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint =
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const result = await refreshTokenAPI();

                if (result.success) {
                    processQueue(null, result.token);

                    originalRequest.headers.Authorization = `Bearer ${result.token}`;
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error(result.error || 'Refresh failed');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('role');

                window.dispatchEvent(new Event('userLoggedOut'));

                if (!window.location.pathname.includes('/login')) {
                    sessionStorage.setItem('intendedPath', window.location.pathname);
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 403) {
            console.error('❌ 403 Forbidden - Check token validity or backend permissions');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;