import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {Role} from "../../dto/type/Role";
import {login as loginApi} from "../../api/auth-api";
import "../../App.css";
import {toast} from "react-toastify";

const Login = ({isOpen, onClose, onSwitchToRegister, onLoginSuccess}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleRememberMe = (checked) => {
        setRememberMe(checked);
        if (checked) {
            toast.info("Login details will be remembered");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields");
            toast.warning("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const response = await loginApi(email, password);

            if (!response.success) {
                throw new Error(response.error || "Login failed");
            }

            const { user, token } = response;

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            window.dispatchEvent(new Event('userLoggedIn'));

            toast.success(`Welcome back, ${user.fullName || user.email}!`);

            if (onLoginSuccess) onLoginSuccess();
            onClose();

            if (user.role === Role.ADMIN || user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (err) {
            console.error("Login error:", err);
            const errorMessage = err.message || "Invalid email or password";
            setError(errorMessage);
            toast.error("Invalid email or password!");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        toast.info("Forgot password feature coming soon!");
    };

    const handleSocialLogin = (provider) => {
        toast.info(`${provider} login coming soon!`);
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
                            Sign in to your account
                        </h2>
                        <p className="text-gray-600 text-sm">Welcome back to ShopSpot!</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => handleRememberMe(e.target.checked)}
                                    className="border-gray-300 rounded focus:ring-cyan-500 w-4 h-4 text-cyan-600"
                                    disabled={loading}
                                />
                                <label
                                    htmlFor="remember-me"
                                    className="block ml-2 text-gray-700 text-sm"
                                >
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-pink-500 hover:text-cyan-500 transition-colors"
                                disabled={loading}
                            >
                                Forgot your password?
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-pink-500 via-cyan-500 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 w-full font-semibold text-white transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "🚀 Sign in"
                            )}
                        </button>

                        <div>
                            <p className="text-gray-600 text-sm text-center">
                                If you have no account{" "}
                                <span
                                    onClick={loading ? undefined : onSwitchToRegister}
                                    className={`cursor-pointer font-semi-bold transition-colors ${
                                        loading ? "text-gray-400 cursor-not-allowed" : "text-cyan-600 hover:text-blue-600"
                                    }`}
                                >
                                    create a new account
                                </span>
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="border-gray-300 border-t w-full"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="gap-4 grid grid-cols-2">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("Google")}
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
                                onClick={() => handleSocialLogin("Facebook")}
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

                    {/* Footer */}
                    <p className="mt-6 text-gray-500 text-sm text-center">
                        By continuing you agree to our{" "}
                        <Link
                            to="/terms"
                            className="text-cyan-600 hover:text-cyan-500 font-medium"
                        >
                            Terms & Conditions
                        </Link>
                        ,{" "}
                        <Link
                            to="/privacy"
                            className="text-cyan-600 hover:text-cyan-500 font-medium"
                        >
                            Privacy Policy
                        </Link>{" "}
                        &{" "}
                        <Link
                            to="/refund"
                            className="text-cyan-600 hover:text-cyan-500 font-medium"
                        >
                            Refund-Return Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;