import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/user/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    {/* Login/Register page */}
                    <Route path="/login" element={<AuthPage />} />

                    {/* Home page */}
                    <Route path="/" element={<Home />} />

                    {/* Admin Dashboard */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute role="ADMIN">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* User Dashboard */}
                    <Route
                        path="/user-dashboard"
                        element={
                            <ProtectedRoute role="USER">
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
