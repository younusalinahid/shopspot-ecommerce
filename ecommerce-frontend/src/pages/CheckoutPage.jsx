import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart } = useCart();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            toast.warning('Please login to proceed with checkout');
            return;
        }

        // Check if cart is empty
        if (!cart || !cart.items || cart.items.length === 0) {
            toast.error('Your cart is empty');
            navigate('/');
            return;
        }
    }, [navigate, cart]);

    const handleLoginRedirect = () => {
        // Save intended path for after login
        sessionStorage.setItem('intendedPath', '/checkout');
        navigate('/login');
    };

    // If not logged in, show login prompt
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🔒</span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Login Required
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                Please login to proceed with your checkout
                            </p>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                                <p className="text-yellow-800 dark:text-yellow-200">
                                    You need to be logged in to complete your purchase and save your order details.
                                </p>
                            </div>

                            <button
                                onClick={handleLoginRedirect}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-300 hover:shadow-lg"
                            >
                                Login to Checkout
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-medium transition-colors duration-300"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If cart is empty but user is logged in
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl">🛒</span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                                Your Cart is Empty
                            </h1>

                            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                                Add some products to your cart before checkout
                            </p>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors duration-300 hover:shadow-lg"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main checkout page for logged in users with items in cart
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                        Checkout
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                    Shipping Information
                                </h2>
                                {/* Add your checkout form here */}
                                <p className="text-gray-600 dark:text-gray-400">
                                    Checkout form will be implemented here...
                                </p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Items ({cart.totalItems})</span>
                                        <span>৳{cart.totalPrice?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span className="text-green-600 dark:text-green-400">Free</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                        <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                            <span>Total</span>
                                            <span>৳{cart.totalPrice?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 hover:shadow-lg">
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}