import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth-api';

export const ProtectedRoute = ({ children, role }) => {
    const isLoggedIn = isAuthenticated();
    const userRole = getUserRole();

    console.log('ProtectedRoute Check:', { isLoggedIn, userRole, requiredRole: role });

    if (!isLoggedIn) {
        console.log('Not authenticated, redirecting to home');
        return <Navigate to="/" replace />;
    }

    if (role && userRole !== role) {
        console.log('Role mismatch, redirecting to home');
        return <Navigate to="/" replace />;
    }

    return children;
};