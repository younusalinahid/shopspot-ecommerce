import {Search, ShoppingCart, User, Moon, Sun, Menu, X, Camera} from "lucide-react";
import {useEffect, useState, useRef} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import {productService} from '../../api/productApi';
import logo from "../../assets/logo/logo-6.png";
import playStoreButton from "../../assets/images/get-play-store-icon.png";
import AuthPage from "../../pages/auth/AuthPage";
import {useTheme} from "../../context/ThemeContext";
import UserMenu from "../user/UserMenu";
import {toast} from "react-toastify";
import {useCart} from "../../context/CartContext";

export default function Navbar() {
    const [showAuthPage, setShowAuthPage] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const {isDark, toggleTheme} = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const {cart, fetchCart} = useCart();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("user"));
    const [imageSearchLoading, setImageSearchLoading] = useState(false);
    const desktopImageInputRef = useRef(null);
    const mobileImageInputRef = useRef(null);

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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) {
            setSearchQuery(q);
        }
        setSearchResults([]);
        setIsDropdownOpen(false);
        setIsSearching(false);
    }, [location.search]);

    const cartCount = cart?.totalItems || 0;

    const handleCartClick = async () => {
        if (isLoggedIn) {
            await fetchCart();
            navigate("/cart");
        } else {
            toast.warning("Please log in to view your cart!");
        }
    };

    const handleImageSearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageSearchLoading(true);
        toast.info("AI is analyzing the image...");
        try {
            const result = await productService.searchByImage(file);

            setIsMobileMenuOpen(false);
            navigate('/search?mode=image', {
                state: {imageSearchResults: result}
            });
        } catch (error) {
            toast.error("Image search failed. Please try again.");
        } finally {
            setImageSearchLoading(false);
            e.target.value = '';
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setSearchResults([]);
            setIsDropdownOpen(false);
            return;
        }

        setIsSearching(true);
        setIsDropdownOpen(true);
        try {
            const results = await productService.searchProducts(query);
            setSearchResults(results);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (searchQuery.trim().length < 2) {
            toast.warning("Please enter at least 2 characters to search");
            return;
        }

        setIsDropdownOpen(false);
        setSearchResults([]);
        setIsSearching(false);
        setIsMobileMenuOpen(false);

        try {
            await productService.searchProducts(searchQuery.trim());
        } catch (error) {
            console.error("Silent search sync failed", error);
        }

        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);

        if (document.activeElement) {
            document.activeElement.blur();
        }
    };

    const handleSearchResultClick = (item) => {
        setIsDropdownOpen(false);
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

        if (isProduct) {
            navigate(`/product/${item.id}`);
        } else if (isSubCategory) {
            const subCatId = item.subCategoryId || item.id;
            navigate(`/subcategory/${subCatId}`);
        } else if (isCategory) {
            const catId = item.categoryId || item.id;
            navigate(`/category/${catId}`);
        }
    };

    const renderSearchResults = () => {
        if (!isDropdownOpen) return null;

        if (isSearching) {
            return (
                <div className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 p-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Searching...</p>
                </div>
            );
        }

        if (searchResults.length === 0 && searchQuery.trim().length >= 2) {
            return (
                <div className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 p-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">No results found</p>
                </div>
            );
        }

        if (searchResults.length > 0) {
            return (
                <div
                    className="absolute w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-xl z-50 mt-1 max-h-96 overflow-y-auto">
                    {searchResults.map((item, index) => {
                        let isProduct, isCategory, isSubCategory;
                        let displayText = '';
                        let badge = '';
                        let badgeColor = '';

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
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSearchResultClick(item);
                                }}
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
            <nav
                className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-300 w-full">
                <div className="w-full px-4 lg:px-8">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-1 lg:space-x-2">
                                <img src={logo} alt="ShopSpot Logo" className="w-20 h-20 lg:w-24 lg:h-24"/>
                                <span
                                    className="text-white font-bold text-2xl lg:text-3xl -ml-10">ShopSpot Online</span>
                            </Link>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => searchQuery.trim().length >= 2 && setIsDropdownOpen(true)}
                                    placeholder="Search products, brands, and categories..."
                                    className="w-full pl-6 pr-16 py-3 border-none rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-800 text-lg shadow-lg transition-all duration-300"
                                />
                                {renderSearchResults()}

                                {/* Desktop Camera button */}
                                <button
                                    type="button"
                                    onClick={() => desktopImageInputRef.current?.click()}
                                    disabled={imageSearchLoading}
                                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors p-1"
                                    title="AI Image Searching"
                                >
                                    {imageSearchLoading ? (
                                        <div
                                            className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
                                    ) : (
                                        <Camera size={22}/>
                                    )}
                                </button>
                                <input
                                    ref={desktopImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSearch}
                                />
                            </form>
                        </div>

                        {/* Actions (Cart, Profile, Theme) */}
                        <div className="flex items-center space-x-4 lg:space-x-6">
                            <img
                                src={playStoreButton}
                                alt="Google Play"
                                className="hidden lg:block w-auto h-12 cursor-pointer hover:scale-105 transition-transform duration-200"
                            />

                            <div
                                className="relative cursor-pointer group p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart
                                    className="text-white group-hover:scale-110 transition-transform duration-200"
                                    size={40}/>
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 flex justify-center items-center bg-red-500 rounded-full w-6 h-6 font-bold text-sm text-white shadow-lg">
                                        {cartCount}
                                    </span>
                                )}
                            </div>

                            {isLoggedIn ? (
                                <UserMenu/>
                            ) : (
                                <button
                                    onClick={() => setShowAuthPage(true)}
                                    className="hidden lg:flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                                >
                                    <User size={24}/>
                                    <span>Sign In</span>
                                </button>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun className="text-yellow-400" size={24}/> :
                                    <Moon className="text-white" size={24}/>}
                            </button>

                            <button
                                className="lg:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="text-white" size={28}/> :
                                    <Menu className="text-white" size={28}/>}
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
                                onFocus={() => searchQuery.trim().length >= 2 && setIsDropdownOpen(true)}
                                placeholder="Search products..."
                                className="w-full pl-4 pr-24 py-3 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-white text-gray-800 shadow-lg"
                            />
                            {renderSearchResults()}

                            <div
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                {/* Mobile Camera Button */}
                                <button
                                    type="button"
                                    onClick={() => mobileImageInputRef.current?.click()}
                                    disabled={imageSearchLoading}
                                    className="text-gray-400 hover:text-green-500 transition-colors p-2"
                                >
                                    {imageSearchLoading ? (
                                        <div
                                            className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"/>
                                    ) : (
                                        <Camera size={20}/>
                                    )}
                                </button>
                                <input
                                    ref={mobileImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageSearch}
                                />
                                <button type="submit" className="bg-green-500 hover:bg-green-600 p-2 rounded-full">
                                    <Search className="text-white" size={18}/>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden bg-white dark:bg-gray-800 shadow-xl border-t border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-6 space-y-4">
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

                        <div className="flex justify-center">
                            <img src={playStoreButton} alt="Google Play"
                                 className="w-40 h-auto cursor-pointer hover:scale-105 transition-transform duration-200"/>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Link to="/categories"
                                  className="text-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}>Categories</Link>
                            <Link to="/deals"
                                  className="text-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}>Hot Deals</Link>
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