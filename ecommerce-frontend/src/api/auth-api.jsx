import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const decodeTokenRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Method 1: Check for authorities array (Spring Security default)
        if (payload.authorities && Array.isArray(payload.authorities)) {
            const roleAuth = payload.authorities.find(auth =>
                auth.authority?.startsWith('ROLE_') ||
                typeof auth === 'string' && auth.startsWith('ROLE_')
            );
            if (roleAuth) {
                const authority = typeof roleAuth === 'string' ? roleAuth : roleAuth.authority;
                return authority.replace('ROLE_', '');
            }
        }

        // Method 2: Check for role field
        if (payload.role) {
            return payload.role;
        }

        // Method 3: Check Spring Security's scope claim
        if (payload.scope) {
            const scopes = Array.isArray(payload.scope) ? payload.scope : payload.scope.split(' ');
            const roleScope = scopes.find(s => s.startsWith('ROLE_'));
            if (roleScope) {
                return roleScope.replace('ROLE_', '');
            }
        }

        return "USER"; // Default fallback
    } catch (e) {
        console.error("Error decoding token:", e);
        return "USER";
    }
};

// Login - role will come from backend JWT token
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, role: backendRole, fullName } = response.data;

        // Store token
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("userEmail", email);

        // Priority: Use role from response, then decode from token
        const role = backendRole || decodeTokenRole(token) || "USER";
        localStorage.setItem("role", role);

        // Store full name if available
        if (fullName) {
            localStorage.setItem("fullName", fullName);
        }

        return { token, email, role, fullName };
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

// User Register
export const register = async (fullName, email, password, role = "USER") => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            fullName,
            email,
            password,
            role // Include role in registration
        });

        const { token, role: backendRole } = response.data;

        // Store token and user info
        if (token) {
            localStorage.setItem("jwtToken", token);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("fullName", fullName);

            const userRole = backendRole || decodeTokenRole(token) || "USER";
            localStorage.setItem("role", userRole);
        }

        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Registration failed" };
    }
};

// Logout
export const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) return false;

    // Optional: Check if token is expired
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
    } catch (e) {
        return false;
    }
};

// Get current user
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

// Get user role
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

// Axios interceptor to add token to requests
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

    // Response interceptor to handle 401 errors
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                logout();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};