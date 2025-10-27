import axios from 'axios';
import { refreshToken as refreshTokenAPI } from '../api/auth-api';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwtToken');

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

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const result = await refreshTokenAPI();

                if (result.success) {
                    originalRequest.headers.Authorization = `Bearer ${result.token}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);

                localStorage.clear();
                window.dispatchEvent(new Event('userLoggedOut'));
                window.location.href = '/';

                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 403) {
            console.error('❌ 403 Forbidden - Check token validity or backend permissions');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;