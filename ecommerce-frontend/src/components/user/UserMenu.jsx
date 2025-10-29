import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ShoppingBag } from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import { toast } from "react-toastify";

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const user = JSON.parse(localStorage.getItem("user")) || {
        id: null,
        fullName: "User",
        email: "example@example.com",
        role: "USER"
    };

    const firstName = user.fullName?.split(" ")[0] || "User";

    const handleLogout = () => {
        const keysToRemove = [
            "user",
            "token",
            "accessToken",
            "jwtToken",
            "refreshToken",
            "userEmail",
            "fullName",
            "role"
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        window.dispatchEvent(new Event("userLoggedOut"));
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            oldValue: 'logged-in',
            newValue: null,
            url: window.location.href
        }));

        setIsOpen(false);
        toast.success("Logged out successfully!");

        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-sm transition-all"
            >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="text-white" size={20} />
                </div>
                <span className="text-white font-bold hidden sm:block">{firstName}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <User className="mr-3" size={16}/> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ShoppingBag className="mr-3" size={16}/> My Orders
                    </Link>
                    <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="mr-3" size={16}/> Settings
                    </Link>

                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LogOut className="mr-3" size={16}/> Logout
                    </button>
                </div>
            )}
        </div>
    );
}