import React, {useState} from 'react';
import {Search, ShoppingCart, User} from 'lucide-react';
import playStoreButton from '../assets/images/get-play-store-icon.png';
import logo from '../assets/icons/logo.svg';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center py-6">
                    {/* Logo */}
                    <div className="flex items-center justify-start">
                        <div className="flex items-center">
                            <img
                                src={logo}
                                alt=""
                                className="h-14 w-14 mr-2"
                            />
                            <span className="text-white font-bold text-2xl">ShopSpot Online</span>
                        </div>
                    </div>

                    {/* Search Bar*/}
                    <div className="hidden md:flex flex-1 max-w-5xl mx-8">
                        <div className="relative w-full flex">
                            <input
                                type="text"
                                placeholder="Search Product...."
                                className="w-full px-6 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white text-gray-700 text-xl"
                            />
                            <button
                                className="absolute right-0 top-0 bottom-0 bg-green-400 hover:bg-green-500 px-6 rounded-r-full flex items-center justify-center transition-colors">
                                <Search className="text-white" size={35}/>
                            </button>
                        </div>
                    </div>

                    {/* Right Side Items */}
                    <div className="hidden md:flex items-center space-x-4 ml-auto">
                        {/* Get it on Google Play */}
                        <div className="cursor-pointer">
                            <img
                                src={playStoreButton}
                                alt="Google Play"
                                className="h-12 w-auto"
                            />
                        </div>

                        {/* Cart */}
                        <div className="relative cursor-pointer">
                            <ShoppingCart className="text-white hover:text-gray-200 transition-colors" size={35}/>
                            <span
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
      0
    </span>
                        </div>

                        {/* Sign In */}
                        <div
                            className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-30 transition-all">
                            <User className="text-white mr-2" size={35}/>
                            <span className="text-white font-medium">Sign In</span>
                            <svg className="ml-2 text-white" width="12" height="8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </div>

                        {/* Sign Up */}
                        <div
                            className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2 cursor-pointer hover:bg-opacity-30 transition-all">
                            <User className="text-white mr-2" size={35}/>
                            <span className="text-white font-medium">Sign Up</span>
                            <svg className="ml-2 text-white" width="12" height="8" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}