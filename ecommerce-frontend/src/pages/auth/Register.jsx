import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {register as registerApi} from "../../api/auth-api";
import "../../App.css";
import { toast } from "react-toastify";

const Register = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    if (!isOpen) return null;


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim()) {
            setError("Full name is required");
            toast.warning("Please enter your full name");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            toast.warning("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await registerApi(fullName, email, password);

            if (!response.success) {
                throw new Error(response.error || "Registration failed");
            }
            const { user, token } = response;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);
            window.dispatchEvent(new Event('userLoggedIn'));
            toast.success(`Welcome to ShopSpot, ${user.fullName}! 🎉`);

            if (onRegisterSuccess) onRegisterSuccess();
            onClose();
            navigate("/");

        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err.message || "Registration failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = (provider) => {
        toast.info(`${provider} registration coming soon! 🔄`);
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
                    disabled={loading}
                >
                    ×
                </button>

                <div className="p-8">
                    {/* Heading */}
                    <div className="mb-8 text-center">
                        <h2 className="mb-2 font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-600 animate-float">
                            Create your account
                        </h2>
                        <p className="text-gray-600 text-sm">Join ShopSpot today!</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-pink-500 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter your full name"
                                required
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-pink-500 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Password *
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Create a password (min 6 characters)"
                                required
                                minLength={6}
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block px-3 py-2 border border-cyan-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition-all input-animation shadow-sm hover:shadow-lg"
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 w-full font-semibold text-white transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                "🚀 Sign up"
                            )}
                        </button>

                        {/* Footer: Switch to Login */}
                        <div>
                            <p className="text-gray-600 text-sm text-center">
                                Already have an account?{" "}
                                <span
                                    onClick={loading ? undefined : onSwitchToLogin}
                                    className={`cursor-pointer font-semibold transition-colors ${
                                        loading ? "text-gray-400 cursor-not-allowed" : "text-cyan-600 hover:text-blue-600"
                                    }`}
                                >
                                    Login
                                </span>
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="border-gray-300 border-t w-full"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">
                                    or sign up with
                                </span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="gap-4 grid grid-cols-2">
                            <button
                                type="button"
                                onClick={() => handleSocialRegister("Google")}
                                disabled={loading}
                                className="flex justify-center items-center hover:bg-gray-100 hover:scale-105 hover:rotate-1 px-4 py-2 border border-gray-300 rounded-lg transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                                onClick={() => handleSocialRegister("Facebook")}
                                disabled={loading}
                                className="flex justify-center items-center hover:bg-gray-100 hover:scale-105 hover:-rotate-1 px-4 py-2 border border-gray-300 rounded-lg transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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