import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css'

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login logic
        console.log('Login with:', { email, password, rememberMe });
    };

    return (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4 animate-fadeIn">
            <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-slideIn">
                {/* Header Gradient Bar */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="top-4 right-4 z-10 absolute font-bold text-gray-500 hover:text-gray-700 text-xl"
                >
                    ×
                </button>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <h2 className="mb-2 font-bold text-gray-900 text-2xl">
                            Sign in to your account
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Or {' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="font-medium text-cyan-600 hover:text-blue-600 transition-colors"
                            >
                                create a new account
                            </button>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block px-3 py-2 border border-gray-300 focus:border-cyan-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block px-3 py-2 border border-gray-300 focus:border-cyan-500 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full transition-colors"
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {/* Remember Me and Forgot Password */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="border-gray-300 rounded focus:ring-blue-500 w-4 h-4 text-blue-600"
                                />
                                <label htmlFor="remember-me" className="block ml-2 text-gray-700 text-sm">
                                    Remember me
                                </label>
                            </div>
                            <button type="button" className="text-blue-600 hover:text-blue-500 text-sm">
                                Forgot your password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-500 hover:from-cyan-600 to-blue-500 hover:to-blue-600 hover:shadow-lg px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white hover:scale-105 transition-all animate-pulse-shadow duration-300 ease-in-out transform button-hover"
                        >
                            Sign in
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="border-gray-300 border-t w-full"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">or continue with</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="gap-4 grid grid-cols-2">
                            <button
                                type="button"
                                className="flex justify-center items-center hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
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
                                className="flex justify-center items-center hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg transition-colors"
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

                    {/* Terms and Privacy */}
                    <p className="mt-6 text-gray-500 text-sm text-center">
                        By continuing you agree to our{' '}
                        <Link to="/terms" className="text-cyan-600 hover:text-cyan-500">
                            Terms & Conditions
                        </Link>
                        ,{' '}
                        <Link to="/privacy" className="text-cyan-600 hover:text-cyan-500">
                            Privacy Policy
                        </Link>
                        {' '}&{' '}
                        <Link to="/refund" className="text-cyan-600 hover:text-cyan-500">
                            Refund-Return Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;