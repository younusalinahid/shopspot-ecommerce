// src/components/Navbar.jsx
import React, {useState} from "react";
import {Search, ShoppingCart, User, MapPin, ChevronDown, Bell} from "lucide-react";
import logo from "../assets/icons/logo.svg";
import playStoreButton from "../assets/images/get-play-store-icon.png";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const navigation = [
        {name: 'Find Doctors', href: '/doctors'},
        {name: 'Hospitals', href: '/hospitals'},
        {name: 'Medicines', href: '/medicines'},
        {name: 'Lab Tests', href: '/lab-tests'},
        {name: 'Health Plans', href: '/health-plans'}
    ];

    const userMenuItems = [
        {name: 'My Profile', href: '/profile'},
        {name: 'My Appointments', href: '/appointments'},
        {name: 'Medical Records', href: '/records'},
        {name: 'Prescriptions', href: '/prescriptions'},
        {name: 'Settings', href: '/settings'}
    ];

    return (
        <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between py-4">

                    {/* LEFT - Logo */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <img src={logo} alt="ShopSpot Logo" className="h-12 w-12"/>
                        <span className="text-white font-bold text-4xl">ShopSpot Online</span>
                    </div>

                    {/* CENTER - Search Bar */}
                    <div className="hidden md:flex flex-1 justify-center px-6">
                        <div className="relative w-full max-w-2xl">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full px-5 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white text-gray-700 text-lg"
                            />
                            <button
                                className="absolute right-0 top-0 bottom-0 bg-green-500 hover:bg-green-600 px-5 rounded-r-full flex items-center justify-center transition-colors">
                                <Search className="text-white" size={25}/>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT - Buttons */}
                    <div className="flex items-center space-x-4 flex-shrink-0">

                        {/* Google Play */}
                        <img
                            src={playStoreButton}
                            alt="Google Play"
                            className="h-12 w-auto cursor-pointer"
                        />

                        {/* Location */}
                        <div
                            className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-blue-600 cursor-pointer">
                            <MapPin className="h-4 w-4"/>
                            <span className="text-sm">Dhaka</span>
                            <ChevronDown className="h-4 w-4"/>
                        </div>

                        {/* Cart */}
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="text-white hover:text-gray-200" size={30}/>
                            <span
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
                        </div>

                        {/*/!* User Menu *!/*/}
                        {/*<div className="relative">*/}
                        {/*    <button*/}
                        {/*        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"*/}
                        {/*    >*/}
                        {/*        <div*/}
                        {/*            className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">*/}
                        {/*            <User className="h-4 w-4 text-white"/>*/}
                        {/*        </div>*/}
                        {/*        <div className="hidden sm:block text-left">*/}
                        {/*            <p className="text-sm font-medium">John Doe</p>*/}
                        {/*            <p className="text-xs text-gray-500">Patient</p>*/}
                        {/*        </div>*/}
                        {/*        <ChevronDown className="h-4 w-4 hidden sm:block"/>*/}
                        {/*    </button>*/}

                            {/* Sign In */}
                            <button
                                className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 hover:bg-opacity-30 transition-all">
                                <User className="text-white mr-2" size={25}/>
                                <span className="text-white font-medium">Sign In</span>
                            </button>

                            {/* Sign Up */}
                            <button
                                className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 hover:bg-opacity-30 transition-all">
                                <User className="text-white mr-2" size={25}/>
                                <span className="text-white font-medium">Sign Up</span>
                            </button>

                        {/* Notifications */}
                        <button
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200 relative">
                            <Bell className="h-5 w-5"/>
                            <span
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                2
              </span>
                        </button>

                        </div>
                    </div>
                </div>
        </nav>
    );
}
