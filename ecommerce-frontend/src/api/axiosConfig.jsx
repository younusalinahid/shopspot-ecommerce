// src/config/axiosConfig.js - NEW FILE
import axios from 'axios';
import { refreshToken as refreshTokenAPI } from '../api/auth-api';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwtToken');

        // Add token to headers if exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token added to request:', config.url);
        } else {
            console.warn('⚠️ No token found for request:', config.url);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401/403 errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If 401 Unauthorized and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const result = await refreshTokenAPI();

                if (result.success) {
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${result.token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                // Clear auth data and redirect to login
                localStorage.clear();
                window.dispatchEvent(new Event('userLoggedOut'));
                window.location.href = '/';

                return Promise.reject(refreshError);
            }
        }

        // If 403 Forbidden
        if (error.response?.status === 403) {
            console.error('❌ 403 Forbidden - Check token validity or backend permissions');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;