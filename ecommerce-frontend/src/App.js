import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./components/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import ProductList from "./components/user/product-list";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import {ThemeProvider} from "./context/ThemeContext";
import {CartProvider} from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
    useEffect(() => {
    }, []);

    return (
        <ThemeProvider>
            <CartProvider>
                <Router>
                    {/* Navbar outside Routes so it appears on all pages */}
                    <Navbar />

                    <Routes>
                        <Route path="/login" element={<AuthPage/>}/>

                        <Route path="/" element={<Home/>}/>

                        <Route path="/subcategory/:subCategoryId" element={<ProductList/>}/>

                        <Route path="/product/:productId" element={<ProductDetails/>}/>

                        {/* ✅ Add Cart Route */}
                        <Route path="/cart" element={<CartPage/>}/>
                        <Route path="/checkout" element={<CheckoutPage />} />

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
                                    <UserDashboard/>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>

                    <ToastContainer
                        position="top-right"
                        autoClose={1000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        pauseOnHover
                        theme="colored"
                    />
                </Router>
            </CartProvider>
        </ThemeProvider>
    );
}

export default App;