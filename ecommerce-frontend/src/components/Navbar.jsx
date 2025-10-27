import React, { useEffect, useState } from "react";
import { Search, ShoppingCart, User, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/icons/img.png";
import playStoreButton from "../assets/images/get-play-store-icon.png";
import AuthPage from "../pages/auth/AuthPage";
import { useTheme } from "../context/ThemeContext";
import UserMenu from "./user/UserMenu";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const [showAuthPage, setShowAuthPage] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { cart, fetchCart } = useCart(); // fetchCart add করুন

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
            toast.warning("Please log in to view your cart!", );
        }
    };

    const cartCount = cart?.totalItems || 0;

    return (
        <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-gray-800 dark:to-gray-900 shadow-md transition-colors duration-300">
            <div className="mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center py-5">

                    <Link to="/" className="flex flex-shrink-0 items-center space-x-2">
                        <img src={logo} alt="ShopSpot Logo" className="w-10 h-10" />
                        <span className="text-white font-bold text-sm sm:text-xl">ShopSpot Online</span>
                    </Link>

                    <div className="hidden md:flex flex-1 justify-center px-4">
                        <div className="relative w-full max-w-xl">
                            <input type="text" placeholder="Search products..." className="px-4 py-2 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-white w-full text-gray-700 dark:text-gray-200 dark:bg-gray-700 text-sm transition-colors duration-300"/>
                            <button className="top-0 right-0 bottom-0 absolute flex justify-center items-center bg-green-500 hover:bg-green-600 px-4 rounded-r-full transition-colors">
                                <Search className="text-white" size={35}/>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center space-x-3">
                        <img src={playStoreButton} alt="Google Play" className="w-auto h-10 cursor-pointer"/>

                        {/* Cart Icon */}
                        <div className="relative cursor-pointer" onClick={handleCartClick}>
                            <ShoppingCart className="text-white hover:text-gray-200" size={35}/>
                            {cartCount > 0 && (
                                <span className="-top-1.5 -right-1.5 absolute flex justify-center items-center bg-red-500 rounded-full w-5 h-5 font-bold text-xs text-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>

                        {isLoggedIn ? <UserMenu /> : (
                            <button onClick={() => setShowAuthPage(true)} className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-sm transition-all">
                                <User className="mr-1 text-white" size={35}/>
                                <span className="text-white font-bold">Sign In</span>
                            </button>
                        )}

                        <button onClick={toggleTheme} className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all" aria-label="Toggle theme">
                            {isDark ? <Sun className="text-yellow-400" size={24}/> : <Moon className="text-white" size={24}/>}
                        </button>
                    </div>
                </div>
            </div>

            {showAuthPage && <AuthPage isLoginOpen={true} onClose={() => setShowAuthPage(false)} onLoginSuccess={() => setIsLoggedIn(true)} />}
        </nav>
    );
}