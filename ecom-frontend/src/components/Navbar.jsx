import React, { useState } from "react";
import { Search, ShoppingCart, User, MapPin, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/icons/logo.svg";
import playStoreButton from "../assets/images/get-play-store-icon.png";
import LoginModal from "../pages/Login";

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    const openLoginModal = () => {
        setShowLoginModal(true);
        setShowRegisterModal(false);
    };

    const openRegisterModal = () => {
        setShowRegisterModal(true);
        setShowLoginModal(false);
    };

    return (
        <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md">
            <div className="mx-auto px-4 max-w-7xl">
                <div className="flex justify-between items-center py-5">

                    {/* LEFT - Logo (redirect to /) */}
                    <Link to="/" className="flex flex-shrink-0 items-center space-x-2">
                        <img src={logo} alt="ShopSpot Logo" className="w-10 h-10" />
                        <span className="text-white font-bold text-sm sm:text-base">
                            ShopSpot Online
                        </span>
                    </Link>

                    {/* CENTER - Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center px-4">
                        <div className="relative w-full max-w-xl">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="px-4 py-2 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-white w-full text-gray-700 text-sm"
                            />
                            <button
                                className="top-0 right-0 bottom-0 absolute flex justify-center items-center bg-green-500 hover:bg-green-600 px-4 rounded-r-full transition-colors">
                                <Search className="text-white" size={20} />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT - Items */}
                    <div className="flex flex-shrink-0 items-center space-x-3">

                        {/* Google Play */}
                        <img
                            src={playStoreButton}
                            alt="Google Play"
                            className="w-auto h-10 cursor-pointer"
                        />

                        {/*/!* Location *!/*/}
                        {/*<div className="hidden lg:flex items-center space-x-1 text-white hover:text-gray-200 text-sm cursor-pointer">*/}
                        {/*    <MapPin className="w-4 h-4" />*/}
                        {/*    <span>Dhaka</span>*/}
                        {/*    <ChevronDown className="w-3 h-3" />*/}
                        {/*</div>*/}

                        {/* Cart */}
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="text-white hover:text-gray-200" size={35} />
                            <span className="-top-1.5 -right-1.5 absolute flex justify-center items-center bg-red-500 rounded-full w-4 h-4 font-bold text-[10px] text-white">
                                {cartCount}
                            </span>
                        </div>

                        {/* Sign In */}
                        <button
                            onClick={openLoginModal}
                            className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-sm transition-all"
                        >
                            <User className="mr-1 text-white" size={35} />
                            <span className="text-white font-bold">Sign In</span>
                        </button>

                    </div>
                </div>
            </div>

            {/* Modals */}
            {showLoginModal && (
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSwitchToRegister={openRegisterModal}
                />
            )}
        </nav>
    );
}