import {Search, ShoppingCart, User, Moon, Sun, Menu, X, Camera, Phone, Mail, Sparkles} from "lucide-react";
import {useEffect, useState, useRef} from 'react';
import {useNavigate, useLocation, Link} from 'react-router-dom';
import {productService} from '../../api/productApi';
import logo from "../../assets/logo/logo-mark.png";
import AuthPage from "../../pages/auth/AuthPage";
import {useTheme} from "../../context/ThemeContext";
import UserMenu from "../user/UserMenu";
import {toast} from "react-toastify";
import {useCart} from "../../context/CartContext";
import {useSiteContent} from "../../hooks/useSiteContent";
import SITE_CONTENT_DEFAULTS from "./siteContentDefaults";

// Header links. "Deals" is the Shop page filtered to discounted products.
const NAV_LINKS = [
    {to: '/', label: 'Home', isActive: (loc) => loc.pathname === '/'},
    {to: '/shop', label: 'Shop', isActive: (loc) => loc.pathname === '/shop' && !new URLSearchParams(loc.search).get('sale')},
    {to: '/shop?sale=1', label: 'Deals', isActive: (loc) => loc.pathname === '/shop' && new URLSearchParams(loc.search).get('sale') === '1'},
];

const navLinkCls = (active) => `relative px-3 xl:px-4 py-2 text-[15px] xl:text-base font-semibold whitespace-nowrap rounded-full transition-colors ${active
    ? 'text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30'
    : 'text-gray-700 dark:text-gray-200 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`;

export default function Navbar() {
    const {storeName, logoUrl: siteLogoUrl, settings: siteSettings} = useSiteContent();

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
        setIsMobileMenuOpen(false);
    }, [location.pathname, location.search]);

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

    const phone = siteSettings?.contactPhone;
    const email = siteSettings?.contactEmail;
    // Header look and announcement come from Admin -> Site Content (with built-in defaults)
    const D = SITE_CONTENT_DEFAULTS.settings;
    const pick = (key) => siteSettings?.[key] || D[key];
    const showTopBar = siteSettings?.showTopBar !== false;
    const brandColor = pick('brandColor');
    const announcementText = pick('announcementText');
    const announcementLinkText = pick('announcementLinkText');
    const announcementLinkUrl = pick('announcementLinkUrl');
    const isInternalLink = announcementLinkUrl?.startsWith('/');

    const searchForm = (mobile) => (
        <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setIsDropdownOpen(true)}
                placeholder={mobile ? 'Search products...' : 'Search products, categories...'}
                aria-label="Search products"
                className="w-full h-11 pl-5 pr-28 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-emerald-700 focus:bg-white dark:focus:bg-gray-800 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-[15px] transition-colors"
            />
            {renderSearchResults()}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                {/* AI image search: highlighted so people notice it */}
                <button
                    type="button"
                    onClick={() => (mobile ? mobileImageInputRef : desktopImageInputRef).current?.click()}
                    disabled={imageSearchLoading}
                    className="group/ai relative flex items-center gap-1 h-8 pl-2 pr-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-fuchsia-500/30 ring-2 ring-white dark:ring-gray-800 hover:scale-105 transition-transform disabled:opacity-70"
                    title="AI image search: upload a photo to find similar products"
                    aria-label="AI image search"
                >
                    {imageSearchLoading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        : <Camera size={15}/>}
                    <span>AI</span>
                    <Sparkles size={11} className="absolute -top-1 -right-1 text-yellow-300 fill-yellow-300"/>
                </button>
                <button type="submit" aria-label="Search"
                        className="p-2 text-gray-600 hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-300 transition-colors">
                    <Search size={19}/>
                </button>
            </div>
            <input
                ref={mobile ? mobileImageInputRef : desktopImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSearch}
            />
        </form>
    );

    return (
        <>
            {/* Announcement bar */}
            {showTopBar && (
            <div className="w-full text-white/90 text-xs sm:text-sm" style={{backgroundColor: pick('topBarColor')}}>
                <div className="w-full px-3 sm:px-6 lg:px-10 h-9 flex items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-5 min-w-0">
                        {phone && (
                            <a href={`tel:${phone.replace(/[^+0-9]/g, '')}`} className="flex items-center gap-1.5 hover:text-white whitespace-nowrap">
                                <Phone size={14}/> {phone}
                            </a>
                        )}
                        {email && (
                            <a href={`mailto:${email}`} className="hidden xl:flex items-center gap-1.5 hover:text-white truncate">
                                <Mail size={14}/> {email}
                            </a>
                        )}
                    </div>
                    <p className="flex-1 md:flex-none text-center truncate">
                        {announcementText}
                        {announcementLinkText && announcementLinkUrl && (
                            <>
                                <span className="mx-2 sm:mx-3 opacity-50">|</span>
                                {isInternalLink ? (
                                    <Link to={announcementLinkUrl} className="font-semibold text-white hover:underline underline-offset-2">{announcementLinkText}</Link>
                                ) : (
                                    <a href={announcementLinkUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline underline-offset-2">{announcementLinkText}</a>
                                )}
                            </>
                        )}
                    </p>
                    <button onClick={toggleTheme}
                            className="hidden md:flex items-center gap-1.5 hover:text-white whitespace-nowrap"
                            aria-label="Toggle theme">
                        {isDark ? <Sun size={14}/> : <Moon size={14}/>}
                        {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                </div>
            </div>
            )}

            {/* Main header */}
            <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
                <div className="w-full px-3 sm:px-6 lg:px-10">
                    <div className="flex items-center gap-3 lg:gap-6 xl:gap-8 h-16 sm:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
                            <span className="flex items-center justify-center rounded-xl p-1 sm:p-1.5 flex-shrink-0"
                                  style={{backgroundColor: pick('logoBgColor')}}>
                                <img src={siteLogoUrl || logo} alt={`${storeName} logo`}
                                     className="h-8 sm:h-10 w-auto max-w-[110px] object-contain"/>
                            </span>
                            <span className="dark:text-white font-extrabold tracking-tight text-xl sm:text-2xl lg:text-[1.7rem] leading-none truncate"
                                  style={isDark ? undefined : {color: brandColor}}>
                                {storeName}
                            </span>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map(item => (
                                <Link key={item.label} to={item.to} className={navLinkCls(item.isActive(location))}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Search (desktop) */}
                        <div className="hidden lg:block flex-1 min-w-0 max-w-xl ml-auto">
                            {searchForm(false)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0 flex-shrink-0">
                            {isLoggedIn ? (
                                <UserMenu/>
                            ) : (
                                <button
                                    onClick={() => setShowAuthPage(true)}
                                    className="hidden sm:flex items-center gap-2 h-11 px-3 rounded-full text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <User size={21}/>
                                    <span>Account</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleCartClick}
                                aria-label="Open cart"
                                className="relative flex items-center gap-2 h-11 px-2.5 sm:px-3 rounded-full text-gray-800 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="relative">
                                    <ShoppingCart size={22}/>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2.5 flex justify-center items-center bg-red-500 rounded-full min-w-[1.15rem] h-[1.15rem] px-1 font-bold text-[11px] text-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </span>
                                <span className="hidden sm:inline">Cart</span>
                            </button>

                            <button
                                className="lg:hidden p-2.5 rounded-full text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Open menu"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                            </button>
                        </div>
                    </div>

                    {/* Search (phones/tablets) */}
                    <div className="lg:hidden pb-3">
                        {searchForm(true)}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white dark:bg-gray-900 shadow-xl border-b border-gray-200 dark:border-gray-800">
                    <div className="px-4 py-5 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            {NAV_LINKS.map(item => (
                                <Link key={item.label} to={item.to}
                                      className={`text-center py-3 rounded-xl font-semibold ${item.isActive(location)
                                          ? 'bg-emerald-900 text-white'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                            {!isLoggedIn && (
                                <button
                                    onClick={() => setShowAuthPage(true)}
                                    className="col-span-2 flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white py-3 rounded-xl font-semibold transition-colors"
                                >
                                    <User size={20}/> Sign In / Register
                                </button>
                            )}
                            {[
                                {to: "/compare", label: "Compare"},
                                ...(isLoggedIn ? [{to: "/orders", label: "My Orders"}] : []),
                            ].map(item => (
                                <Link key={item.to} to={item.to}
                                      className="text-center py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                                    {item.label}
                                </Link>
                            ))}
                            <button onClick={toggleTheme}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                                {isDark ? <Sun className="w-5 h-5 text-yellow-400"/> : <Moon className="w-5 h-5"/>}
                                {isDark ? 'Light mode' : 'Dark mode'}
                            </button>
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