import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, User, Moon, Sun, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/logo3.png";
import playStoreButton from "../assets/images/get-play-store-icon.png";
import AuthPage from "../pages/auth/AuthPage";
import { useTheme } from "../context/ThemeContext";
import UserMenu from "./user/UserMenu";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [showAuthPage, setShowAuthPage] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { cart, fetchCart } = useCart();

    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));

    useEffect(() => {
        const handleStorageChange = () => {
            const loggedIn = !!localStorage.getItem("user");
            setIsLoggedIn(loggedIn);

            if (loggedIn) {
                fetchCart();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        handleStorageChange();

        return () => window.removeEventListener("storage", handleStorageChange);
    }, [fetchCart]);

    const handleCartClick = async () => {
        if (isLoggedIn) {
            await fetchCart();
            navigate("/cart");
        } else {
            toast.warning("Please log in to view your cart!");
        }
    };

    const cartCount = cart?.totalItems || 0;

    return (
        <>
            {/* Main Navbar */}
            <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-300 w-full">
                <div className="w-full px-4 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Left Section - Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-1 lg:space-x-2">
                                <img src={logo} alt="ShopSpot Logo" className="w-20 h-20 lg:w-24 lg:h-24" />
                                <span className="text-white font-bold text-2xl lg:text-3xl -ml-10">ShopSpot Online</span>
                            </Link>
                        </div>

                        {/* Center Section - Search Bar (Desktop) */}
                        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search products, brands, and categories..."
                                    className="w-full px-6 py-3 border-none rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-800 text-lg shadow-lg transition-all duration-300"
                                />
                                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 p-3 rounded-full transition-colors shadow-lg">
                                    <Search className="text-white" size={24}/>
                                </button>
                            </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center space-x-4 lg:space-x-6">
                            {/* Play Store Button */}
                            <img
                                src={playStoreButton}
                                alt="Google Play"
                                className="hidden lg:block w-auto h-12 cursor-pointer hover:scale-105 transition-transform duration-200"
                            />

                            {/* Cart Icon */}
                            <div
                                className="relative cursor-pointer group p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart className="text-white group-hover:scale-110 transition-transform duration-200" size={40}/>
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex justify-center items-center bg-red-500 rounded-full w-6 h-6 font-bold text-sm text-white shadow-lg">
                                        {cartCount}
                                    </span>
                                )}
                            </div>

                            {/* User Menu / Login */}
                            {isLoggedIn ? (
                                <UserMenu />
                            ) : (
                                <button
                                    onClick={() => setShowAuthPage(true)}
                                    className="hidden lg:flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                                >
                                    <User size={24}/>
                                    <span>Sign In</span>
                                </button>
                            )}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <Sun className="text-yellow-400" size={24}/>
                                ) : (
                                    <Moon className="text-white" size={24}/>
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="text-white" size={28}/>
                                ) : (
                                    <Menu className="text-white" size={28}/>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="lg:hidden pb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-4 py-3 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-white text-gray-800 shadow-lg"
                            />
                            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 p-2 rounded-full">
                                <Search className="text-white" size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-gray-800 shadow-xl border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-6 space-y-4">
                        {/* Mobile User Action */}
                        {!isLoggedIn && (
                            <button
                                onClick={() => {
                                    setShowAuthPage(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-4 rounded-xl font-semibold transition-colors"
                            >
                                <User size={20}/>
                                <span>Sign In / Register</span>
                            </button>
                        )}

                        {/* Mobile Play Store */}
                        <div className="flex justify-center">
                            <img
                                src={playStoreButton}
                                alt="Google Play"
                                className="w-40 h-auto cursor-pointer hover:scale-105 transition-transform duration-200"
                            />
                        </div>

                        {/* Additional Mobile Links */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                to="/categories"
                                className="text-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Categories
                            </Link>
                            <Link
                                to="/deals"
                                className="text-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Hot Deals
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            {showAuthPage && (
                <AuthPage
                    isLoginOpen={true}
                    onClose={() => setShowAuthPage(false)}
                    onLoginSuccess={() => {
                        setIsLoggedIn(true);
                        setIsMobileMenuOpen(false);
                    }}
                />
            )}
        </>
    );
}