import React, { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { setupAxiosInterceptors } from './api/auth-api';
import Navbar from './components/Navbar';
import Home from "./components/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import {ProtectedRoute} from "./components/ProtectedRoute";

function App() {
    useEffect(() => {
        // Setup axios interceptors when app loads
        setupAxiosInterceptors();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthPage />}/>

                <Route path="/" element={
                    <>
                        <Navbar />
                        <Home />
                    </>
                }/>

                {/* Admin Dashboard - Protected */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard/>
                        </ProtectedRoute>
                    }
                />

                {/* User Dashboard - Protected */}
                <Route
                    path="/user-dashboard"
                    element={
                        <ProtectedRoute role="USER">
                            <>
                                <Navbar/>
                                <UserDashboard/>
                            </>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;