import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth-api';

export const ProtectedRoute = ({ children, role }) => {
    const isLoggedIn = isAuthenticated();
    const userRole = getUserRole();

    console.log('ProtectedRoute Check:', { isLoggedIn, userRole, requiredRole: role });

    // If not logged in, redirect to home
    if (!isLoggedIn) {
        console.log('Not authenticated, redirecting to home');
        return <Navigate to="/" replace />;
    }

    // If logged in but role doesn't match, redirect to home
    if (role && userRole !== role) {
        console.log('Role mismatch, redirecting to home');
        return <Navigate to="/" replace />;
    }

    // All checks passed, render children
    return children;
};