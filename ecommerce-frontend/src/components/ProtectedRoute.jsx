import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth-api';

export const ProtectedRoute = ({ children, role }) => {
    const isLoggedIn = isAuthenticated();
    const userRole = getUserRole();

    // If not logged in, redirect to appropriate login page
    if (!isLoggedIn) {
        if (role === 'ADMIN') {
            return <Navigate to="/admin-login" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // If logged in but role doesn't match, redirect to home
    if (role && userRole !== role) {
        // If user tries to access admin panel without ADMIN role
        if (role === 'ADMIN') {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
};