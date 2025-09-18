import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/icons/logo.svg';

const Register = () => {
    return (
        <div className="flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 min-h-screen">

            <div className="space-y-8 bg-white shadow-lg p-10 rounded-xl w-full max-w-md">
                <div>
                    <h2 className="font-extrabold text-gray-900 text-3xl text-center">
                        Create your account
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm text-center">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <form className="space-y-6 mt-8">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full-name" className="block font-medium text-gray-700 text-sm">
                                Full Name
                            </label>
                            <input
                                id="full-name"
                                name="name"
                                type="text"
                                required
                                className="block shadow-sm mt-1 px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-200 placeholder-gray-400"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block font-medium text-gray-700 text-sm">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block shadow-sm mt-1 px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-200 placeholder-gray-400"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block font-medium text-gray-700 text-sm">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="block shadow-sm mt-1 px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-200 placeholder-gray-400"
                                placeholder="Create a password"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm-password" className="block font-medium text-gray-700 text-sm">
                                Confirm Password
                            </label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="block shadow-sm mt-1 px-4 py-3 border border-gray-300 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full transition-all duration-200 placeholder-gray-400"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative flex justify-center bg-indigo-600 hover:bg-indigo-700 px-4 py-3 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full font-medium text-white text-sm hover:scale-[1.02] transition-all duration-200 transform"
                        >
                            Create Account
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="border-gray-300 border-t w-full"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                        </div>
                    </div>

                    <div className="gap-3 grid grid-cols-2 mt-6">
                        <button
                            type="button"
                            className="flex justify-center items-center bg-white hover:bg-gray-50 shadow-sm px-4 py-2 border border-gray-300 rounded-md w-full font-medium text-gray-700 text-sm transition-all duration-200"
                        >
                            <img className="mr-2 w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex justify-center items-center bg-white hover:bg-gray-50 shadow-sm px-4 py-2 border border-gray-300 rounded-md w-full font-medium text-gray-700 text-sm transition-all duration-200"
                        >
                            <img className="mr-2 w-5 h-5" src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook logo" />
                            Facebook
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-gray-600 text-sm text-center">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                </Link>
            </div>
        </div>
    );
};

export default Register;