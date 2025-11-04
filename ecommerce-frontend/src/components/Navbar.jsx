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
import { productService } from "../api/product-api";

export default function Navbar() {
    const [showAuthPage, setShowAuthPage] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { cart, fetchCart } = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
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

    const cartCount = cart?.totalItems || 0;

    const handleCartClick = async () => {
        if (isLoggedIn) {
            await fetchCart();
            navigate("/cart");
        } else {
            toast.warning("Please log in to view your cart!");
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await productService.searchProducts(query);
            console.log("Search results:", results); // Debug
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (searchQuery.length < 2) {
            toast.warning("Please enter at least 2 characters to search");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);

        // Close dropdown and mobile menu
        setSearchResults([]);
        setIsMobileMenuOpen(false);
    };

    const handleSearchResultClick = (item) => {
        setSearchResults([]);
        setSearchQuery("");
        setIsMobileMenuOpen(false);

        let isProduct, isCategory, isSubCategory;

        if (item.type) {
            isProduct = item.type === 'PRODUCT';
            isCategory = item.type === 'CATEGORY';
            isSubCategory = item.type === 'SUBCATEGORY' || item.type === 'SUB_CATEGORY';
        } else {
            isProduct = item.price !== undefined;
            const hasCategory = item.categoryId !== undefined || item.category !== undefined;
            const hasSubCategory = item.subCategoryId !== undefined || item.subCategory !== undefined;
            isCategory = hasCategory && !hasSubCategory;
            isSubCategory = hasSubCategory;
        }

        // Navigate based on item type
        if (isProduct) {
            navigate(`/product/${item.id}`);
        } else if (isSubCategory) {
            // Use simple subcategory route
            const subCatId = item.subCategoryId || item.id;
            navigate(`/subcategory/${subCatId}`);
        } else if (isCategory) {
            // Use simple category route
            const catId = item.categoryId || item.id;
            navigate(`/category/${catId}`);
        }
    };

    const renderSearchResults = () => {
        if (isSearching) {
            return (
                <div className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 p-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Searching...</p>
                </div>
            );
        }

        if (searchResults.length === 0 && searchQuery.length >= 2) {
            return (
                <div className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 p-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">No results found</p>
                </div>
            );
        }

        if (searchResults.length > 0) {
            return (
                <div className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 max-h-96 overflow-y-auto">
                    {searchResults.map((item, index) => {
                        let isProduct, isCategory, isSubCategory;
                        let displayText = '';
                        let badge = '';
                        let badgeColor = '';

                        // Check if backend sends 'type' field
                        if (item.type) {
                            isProduct = item.type === 'PRODUCT';
                            isCategory = item.type === 'CATEGORY';
                            isSubCategory = item.type === 'SUBCATEGORY' || item.type === 'SUB_CATEGORY';
                        } else {
                            // Fallback: detect by fields
                            isProduct = item.price !== undefined;
                            const hasCategory = item.categoryId !== undefined || item.category !== undefined;
                            const hasSubCategory = item.subCategoryId !== undefined || item.subCategory !== undefined;
                            isCategory = hasCategory && !hasSubCategory;
                            isSubCategory = hasSubCategory;
                        }

                        if (isProduct) {
                            displayText = `${item.name} - ৳${item.price.toFixed(2)}`;
                            badge = 'Product';
                            badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
                        } else if (isSubCategory) {
                            displayText = item.name;
                            badge = 'SubCategory';
                            badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
                        } else if (isCategory) {
                            displayText = item.name;
                            badge = 'Category';
                            badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
                        }

                        return (
                            <button
                                key={`${item.id}-${index}`}
                                onClick={() => handleSearchResultClick(item)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
                            >
                                <span className="text-gray-800 dark:text-gray-200 flex-1">{displayText}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ml-2 ${badgeColor}`}>
                                    {badge}
                                </span>
                            </button>
                        );
                    })}
                </div>
            );
        }

        return null;
    };

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
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search products, brands, and categories..."
                                    className="w-full px-6 py-3 border-none rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-800 text-lg shadow-lg transition-all duration-300"
                                />
                                {renderSearchResults()}
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 p-3 rounded-full transition-colors shadow-lg"
                                >
                                    <Search className="text-white" size={24} />
                                </button>
                            </form>
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
                                <ShoppingCart className="text-white group-hover:scale-110 transition-transform duration-200" size={40} />
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
                                    <User size={24} />
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
                                    <Sun className="text-yellow-400" size={24} />
                                ) : (
                                    <Moon className="text-white" size={24} />
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="text-white" size={28} />
                                ) : (
                                    <Menu className="text-white" size={28} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="lg:hidden pb-4">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full px-4 py-3 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-white text-gray-800 shadow-lg"
                            />
                            {renderSearchResults()}
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 p-2 rounded-full"
                            >
                                <Search className="text-white" size={20} />
                            </button>
                        </form>
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
                                <User size={20} />
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