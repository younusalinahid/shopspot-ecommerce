import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/user/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import {ProtectedRoute} from "./components/ProtectedRoute";

function App() {
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

                {/* Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminDashboard/>
                        </ProtectedRoute>
                    }
                />

                {/* User Dashboard */}
                <Route
                    path="/user-dashboard"
                    element={
                        <>
                            <Navbar/>
                            <ProtectedRoute role="USER">
                                <UserDashboard/>
                            </ProtectedRoute>
                        </>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
