import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./components/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./components/user/UserDashboard";
import AuthPage from "./pages/auth/AuthPage";
import {ProtectedRoute} from "./components/ProtectedRoute";
import ProductList from "./components/user/productList";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import {ThemeProvider} from "./context/ThemeContext";
import {CartProvider} from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    useEffect(() => {
    }, []);

    return (
        <ThemeProvider>
            <CartProvider>
                <Router>
                    <Navbar />

                    <Routes>
                        <Route path="/login" element={<AuthPage/>}/>

                        <Route path="/" element={<Home/>}/>

                        <Route path="/subcategory/:subCategoryId" element={<ProductList/>}/>
                        <Route path="/product/:productId" element={<ProductDetails/>}/>

                        <Route path="/cart" element={<CartPage/>}/>
                        <Route path="/checkout" element={<CheckoutPage />} />

                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Admin Dashboard - Protected */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute role="ADMIN">
                                    <AdminDashboard/>
                                </ProtectedRoute>
                            }
                        />

                        {/* User Dashboard - Protected */}
                        <Route
                            path="/user"
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