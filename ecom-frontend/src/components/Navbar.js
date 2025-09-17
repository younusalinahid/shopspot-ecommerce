import React from "react";
import { Search, ShoppingCart, User } from "lucide-react";
import playStoreButton from "../assets/images/get-play-store-icon.png";
import logo from "../assets/icons/logo.svg";

export default function Navbar() {
    return (
        <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between py-5 gap-x-10">

                    {/* LEFT - Logo */}
                    <div className="flex items-center space-x-3 flex-shrink-0">
                        <img src={logo} alt="ShopSpot Logo" className="h-12 w-12" />
                        <span className="text-white font-bold text-2xl">ShopSpot Online</span>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center px-6">
                        <div className="relative w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full px-5 py-3 rounded-full border-none focus:outline-none focus:ring-5 focus:ring-white text-gray-700 text-lg"
                            />
                            <button className="absolute right-0 top-0 bottom-0 bg-green-500 hover:bg-green-600 px-5 rounded-r-full flex items-center justify-center transition-colors">
                                <Search className="text-white" size={28} />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT - Buttons */}
                    <div className="flex items-center space-x-6 flex-shrink-0">
                        {/* Google Play */}
                        <img
                            src={playStoreButton}
                            alt="Google Play"
                            className="h-12 w-auto cursor-pointer"
                        />

                        {/* Cart */}
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="text-white hover:text-gray-200" size={35} />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                0
              </span>
                        </div>

                        {/* Sign In */}
                        <button className="flex items-center bg-white bg-opacity-20 rounded-full px-5 py-2 hover:bg-opacity-30 transition-all">
                            <User className="text-white mr-2" size={35} />
                            <span className="text-white font-medium">Sign In</span>
                        </button>

                        {/* Sign Up */}
                        <button className="flex items-center bg-white bg-opacity-20 rounded-full px-5 py-2 hover:bg-opacity-30 transition-all">
                            <User className="text-white mr-2" size={35} />
                            <span className="text-white font-medium">Sign Up</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
