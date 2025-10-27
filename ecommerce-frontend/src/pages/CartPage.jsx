import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package} from 'lucide-react';
import {toast} from 'react-toastify';

const CartPage = () => {
    const {cart, updateCartItem, removeCartItem, clearCart} = useCart();
    const [updatingItems, setUpdatingItems] = useState({});

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingItems(prev => ({...prev, [cartItemId]: true}));
        try {
            await updateCartItem(cartItemId, newQuantity);
            toast.success('Quantity updated successfully!', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            toast.error('Failed to update quantity', {
                position: "top-right",
            });
        } finally {
            setUpdatingItems(prev => ({...prev, [cartItemId]: false}));
        }
    };

    const handleRemoveItem = async (cartItemId, productName) => {
        await removeCartItem(cartItemId);
        toast.success(`Item ${productName} removed from cart`, {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const handleClearCart = async () => {
        await clearCart();
        toast.success('Cart cleared successfully!', {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const getProductImage = (item) => {
        if (!item.product) return null;
        const imageData = item.product.imageData;
        if (!imageData) return null;
        return imageData;
    };

    const getProductName = (item) => {
        return item.product?.name || "Product Not Available";
    };

    const getProductPrice = (item) => {
        return item.product?.price || 0;
    };

    if (!cart) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"></div>
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                                     style={{animationDelay: '0.1s'}}></div>
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce"
                                     style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                            <div className="mb-6 relative">
                                <div
                                    className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="w-16 h-16 text-cyan-600 dark:text-cyan-400"/>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                Your Cart is Empty
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                                Start adding some amazing products to your cart!
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <Package className="w-5 h-5"/>
                                Explore Products
                                <ArrowRight className="w-5 h-5"/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
                                    style={{
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 0.1}s`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <div className="flex items-center gap-6">
                                        {/* Product Image */}
                                        <div
                                            className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden shadow-md">
                                            {getProductImage(item) ? (
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={getProductName(item)}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-10 h-10 text-gray-400"/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg truncate">
                                                {getProductName(item)}
                                            </h3>
                                            <p className="text-cyan-600 dark:text-cyan-400 font-semibold mb-2 text-xl">
                                                ৳{getProductPrice(item).toFixed(2)}
                                            </p>

                                            <div className="flex gap-3 text-sm">
                                                {item.size && (
                                                    <span
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                                                        {item.size}
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                                                        {item.color}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-center gap-3">
                                            <div
                                                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={updatingItems[item.id] || item.quantity <= 1}
                                                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg disabled:opacity-50 hover:bg-cyan-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                                                >
                                                    <Minus size={16} className="text-gray-700 dark:text-gray-200"/>
                                                </button>

                                                <span
                                                    className="w-10 text-center font-bold text-gray-800 dark:text-gray-200">
                                                    {updatingItems[item.id] ? '...' : item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={updatingItems[item.id]}
                                                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg disabled:opacity-50 hover:bg-cyan-50 dark:hover:bg-gray-500 transition-colors shadow-sm"
                                                >
                                                    <Plus size={16} className="text-gray-700 dark:text-gray-200"/>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveItem(item.id, getProductName(item))}
                                                className="flex items-center gap-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
                                            >
                                                <Trash2 size={16}/>
                                                Remove
                                            </button>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right min-w-[100px]">
                                            <p className="font-bold text-gray-900 dark:text-white text-2xl">
                                                ৳{((getProductPrice(item) * item.quantity) || 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-4 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Order Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal ({cart.totalItems} items)</span>
                                        <span className="font-semibold">৳{(cart.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Tax</span>
                                        <span className="font-semibold">৳0.00</span>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        <div
                                            className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                            <span>Total</span>
                                            <span className="text-cyan-600 dark:text-cyan-400">
                                                ৳{(cart.totalPrice || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        to="/checkout"
                                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight size={20}/>
                                    </Link>

                                    <button
                                        onClick={handleClearCart}
                                        className="flex items-center justify-center gap-2 w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-3 px-4 rounded-xl font-semibold transition-colors duration-300 border border-red-200 dark:border-red-800"
                                    >
                                        <Trash2 size={18}/>
                                        Clear Cart
                                    </button>

                                    <Link
                                        to="/"
                                        className="flex items-center justify-center gap-2 w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors duration-300"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
        </div>
    );
};

export default CartPage;