import React, {useState, useRef, useEffect} from "react";
import {User, LogOut, Settings, ShoppingBag} from "lucide-react";
import {Link} from "react-router-dom";

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const user = JSON.parse(localStorage.getItem("user")) || {
        fullName: "User",
        email: "example@example.com",
        avatar: null
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("jwtToken");

        window.dispatchEvent(new Event("storage"));

        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full text-sm transition-all"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={20}/>
                    </div>
                )}
                <span className="text-white font-bold hidden sm:block">
    {user?.fullName ? user.fullName.split(' ')[0] : "User"}
</span>

            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <User className="mr-3" size={16}/>
                        Profile
                    </Link>

                    <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShoppingBag className="mr-3" size={16}/>
                        My Orders
                    </Link>

                    <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings className="mr-3" size={16}/>
                        Settings
                    </Link>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOut className="mr-3" size={16}/>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
