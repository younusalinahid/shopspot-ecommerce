import React, {useState} from "react";
import {Link} from "react-router-dom";
import "../../App.css";

const Register = ({isOpen, onClose, onSwitchToLogin}) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Register with:", {fullName, email, password, confirmPassword});
    };

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 p-4 animate-fadeIn">
            <div
                className="relative bg-gradient-to-br from-white via-cyan-50 to-blue-50 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-slideIn border border-cyan-200">
                {/* Header Gradient Bar */}
                <div className="bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-500 h-2 animate-pulse"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="top-4 right-4 z-10 absolute font-bold text-gray-500 hover:text-red-500 text-2xl transition-transform transform hover:rotate-90"
                >
                    ×
                </button>

                <div className="p-8">
                    {/* Heading */}
                    <div className="mb-8 text-center">
                        <h2 className="mb-2 font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-600 animate-float">
                            Sign in to your account
                        </h2>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* FullName */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Full Name
                            </label>
                            <input
                                type="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-pink-500 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter your fullName"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-pink-500 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter same password again"
                                required
                            />
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 w-full font-semibold text-white transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            🚀 Sign up
                        </button>

                        {/* Footer: Switch to Login */}
                        <div>
                            <p className="text-gray-600 text-sm text-center">
                                Already have an account?{" "}
                                <span
                                    onClick={onSwitchToLogin}
                                    className="cursor-pointer font-semibold text-cyan-600 hover:text-blue-600 transition-colors"
                                >
    Login
</span>
                            </p>
                        </div>


                        {/* Social Login */}
                        <div className="gap-4 grid grid-cols-2">
                            <button
                                type="button"
                                className="flex justify-center items-center hover:bg-gray-100 hover:scale-105 hover:rotate-1 px-4 py-2 border border-gray-300 rounded-lg transition-all duration-300 ease-in-out shadow-md"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    alt="Google"
                                    className="mr-2 w-5 h-5"
                                />
                                <span className="font-medium text-sm">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex justify-center items-center hover:bg-gray-100 hover:scale-105 hover:-rotate-1 px-4 py-2 border border-gray-300 rounded-lg transition-all duration-300 ease-in-out shadow-md"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                                    alt="Facebook"
                                    className="mr-2 w-5 h-5"
                                />
                                <span className="font-medium text-sm">Facebook</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
