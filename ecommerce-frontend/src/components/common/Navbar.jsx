import {Search, ShoppingCart, User, Moon, Sun, Menu, X, Camera} from "lucide-react";
import {useEffect, useState, useRef} from 'react';
import {useNavigate, useLocation, Link, NavLink} from 'react-router-dom';
import {productService} from '../../api/productApi';
import logo from "../../assets/logo/logo-mark.png";
import playStoreButton from "../../assets/images/get-play-store-icon.png";
import AuthPage from "../../pages/auth/AuthPage";
import {useTheme} from "../../context/ThemeContext";
import UserMenu from "../user/UserMenu";
import {toast} from "react-toastify";
import {useCart} from "../../context/CartContext";
import {useSiteContent} from "../../hooks/useSiteContent";

const MAIN_LINKS = [
    {to: '/', label: 'Home', end: true},
    {to: '/shop', label: 'Shop'},
];

const mainLinkClass = ({isActive}) => `px-6 sm:px-8 py-1.5 rounded-full text-[15px] sm:text-base font-semibold whitespace-nowrap transition-colors ${isActive
    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow'
    : 'text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-gray-800'}`;

export default function Navbar() {
    const {storeName, logoUrl: siteLogoUrl} = useSiteContent();
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

    // Other pages can ask for the login modal with window.dispatchEvent(new Event('openLogin'))
    useEffect(() => {
        const openLogin = () => setShowAuthPage(true);
        window.addEventListener("openLogin", openLogin);
        return () => window.removeEventListener("openLogin", openLogin);
    }, []);

    const cartCount = cart?.totalItems || 0;

    const handleCartClick = async () => {
        if (isLoggedIn) {
            await fetchCart();
        }
        navigate("/cart");
    };

    const handleImageSearch = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsMobileMenuOpen(false);

        navigate('/search?mode=image', {
            state: { imageFile: file }
        });

        e.target.value = '';
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
            {/* Main sections: thin strip above the blue navbar */}
            <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <nav aria-label="Main" className="flex items-center justify-center gap-2 sm:gap-4 h-11 sm:h-12">
                    {MAIN_LINKS.map(item => (
                        <NavLink key={item.to} to={item.to} end={item.end} className={mainLinkClass}>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <nav
                className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-800 dark:to-gray-900 shadow-lg transition-colors duration-300 w-full">
                <div className="w-full px-3 sm:px-4 lg:px-8">
                    {/* Desktop: 3 equal-sided columns so the search bar sits exactly in the middle */}
                    <div className="flex items-center gap-3 lg:gap-6 h-16 sm:h-[72px] lg:h-20 lg:grid lg:grid-cols-[1fr_minmax(0,42rem)_1fr]">
                        {/* Logo */}
                        <div className="flex items-center min-w-0 flex-shrink lg:justify-self-start">
                            <Link to="/" className="flex items-center min-w-0 gap-2 lg:gap-3">
                                <img src={siteLogoUrl || logo} alt={`${storeName} logo`}
                                     className="h-10 sm:h-12 lg:h-14 w-auto max-w-[140px] object-contain flex-shrink-0"/>
                                <span className="text-white font-extrabold tracking-tight text-lg sm:text-2xl lg:text-[1.75rem] leading-none truncate">
                                    {storeName}
                                </span>
                            </Link>
                        </div>

                        {/* Search Bar (Desktop) */}
                        <div className="hidden lg:flex w-full min-w-0">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onFocus={() => searchQuery.trim().length >= 2 && setIsDropdownOpen(true)}
                                    placeholder="Search products, brands, and categories..."
                                    className="w-full h-12 pl-5 pr-14 border-none rounded-full focus:outline-none focus:ring-4 focus:ring-white/40 bg-white text-gray-900 placeholder-gray-500 text-base shadow-md transition-all duration-300"
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
                        <div className="flex items-center flex-shrink-0 ml-auto lg:ml-0 lg:justify-self-end gap-1 sm:gap-3 lg:gap-4">
                            <img
                                src={playStoreButton}
                                alt="Google Play"
                                className="hidden 2xl:block w-auto h-11 cursor-pointer hover:scale-105 transition-transform duration-200"
                            />

                            <div
                                className="relative cursor-pointer group p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                                onClick={handleCartClick}
                                role="button"
                                aria-label="Open cart"
                            >
                                <ShoppingCart
                                    className="text-white w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform duration-200"/>
                                {cartCount > 0 && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 flex justify-center items-center bg-red-500 rounded-full min-w-[1.25rem] h-5 px-1 font-bold text-xs text-white shadow">
                                        {cartCount}
                                    </span>
                                )}
                            </div>

                            {isLoggedIn ? (
                                <UserMenu/>
                            ) : (
                                <button
                                    onClick={() => setShowAuthPage(true)}
                                    className="hidden lg:flex items-center gap-2 bg-white/20 hover:bg-white/30 h-11 px-5 rounded-full text-white font-semibold whitespace-nowrap transition-colors duration-300"
                                >
                                    <User size={20}/>
                                    <span>Sign In</span>
                                </button>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun className="text-yellow-400 w-5 h-5"/> :
                                    <Moon className="text-white w-5 h-5"/>}
                            </button>

                            <button
                                className="lg:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Open menu"
                            >
                                {isMobileMenuOpen ? <X className="text-white w-6 h-6 sm:w-7 sm:h-7"/> :
                                    <Menu className="text-white w-6 h-6 sm:w-7 sm:h-7"/>}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="lg:hidden pb-3 sm:pb-4">
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

                        <button
                            onClick={toggleTheme}
                            className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200"
                        >
                            {isDark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5"/>}
                            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
                        </button>

                        <div className="flex justify-center">
                            <img src={playStoreButton} alt="Google Play"
                                 className="w-40 h-auto cursor-pointer hover:scale-105 transition-transform duration-200"/>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {[
                                {to: "/", label: "Home"},
                                {to: "/shop", label: "Shop"},
                                {to: "/cart", label: `Cart${cartCount ? ` (${cartCount})` : ""}`},
                                {to: "/compare", label: "Compare"},
                                ...(isLoggedIn ? [{to: "/orders", label: "My Orders"}] : []),
                            ].map(item => (
                                <Link key={item.to} to={item.to}
                                      className="text-center text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium py-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
                            ))}
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
                        const intendedPath = sessionStorage.getItem('intendedPath');
                        if (intendedPath) {
                            sessionStorage.removeItem('intendedPath');
                            navigate(intendedPath);
                        }
                    }}
                />
            )}
        </>
    );
}