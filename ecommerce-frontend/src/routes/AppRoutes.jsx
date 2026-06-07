import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../pages/home/HomePage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserDashboard from "../components/user/UserDashboard";
import ProductDetails from "../pages/product/ProductDetailsPage"
import CategoryProducts from "../pages/product/CategoryProductsPage"
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ProductList from "../components/product/ProductList";
import OrderConfirmationPage from "../pages/order/OrderConfirmationPage";
import OrdersPage from "../pages/order/OrdersPage";
import ProfilePage from "../pages/user/ProfilePage";
import SettingsPage from "../pages/user/SettingsPage";
import {ProtectedRoute} from "../components/common/ProtectedRoute";
import CheckoutPage from "../pages/cart/CheckoutPage";
import CartPage from "../pages/cart/CartPage";
import OAuth2CallbackPage from "../pages/auth/OAuth2CallbackPage";

export default function AppRoutes() {
    return (
        <Routes>

            {/* ================= USER PUBLIC ================= */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/subcategory/:subCategoryId" element={<ProductList />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/category/:categoryId" element={<CategoryProducts />} />

                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* ================= AUTH ================= */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
            </Route>

            {/* ================= ADMIN ================= */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/:tab"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminLayout>
                            <AdminDashboard />
                        </AdminLayout>
                    </ProtectedRoute>
                }
            />

            {/* ================= USER DASHBOARD ================= */}
            <Route
                path="/user"
                element={
                    <ProtectedRoute role="USER">
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" />} />

        </Routes>
    );
}