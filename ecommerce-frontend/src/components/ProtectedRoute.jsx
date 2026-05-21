import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../api/auth-api';

export const ProtectedRoute = ({ children, role }) => {
    const isLoggedIn = isAuthenticated();
    const userRole   = getUserRole();
    const location   = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (role && userRole !== role) {
        return <Navigate to={userRole === 'ADMIN' ? '/admin' : '/'} replace />;
    }

    return children;
};