import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, Package, Truck, Shield, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import Footer from "../components/Footer";

const CartPage = () => {
    const { cart, updateCartItem, removeCartItem, clearCart } = useCart();
    const [updatingItems, setUpdatingItems] = useState({});

    const getProductImage = (item) => item.product?.imageData || null;
    const getProductName = (item) => item.product?.name || "Product Not Available";
    const getProductPrice = (item) => item.product?.price || 0;

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));
        try {
            await updateCartItem(cartItemId, newQuantity);
            toast.success('Quantity updated', { position: "top-right", autoClose: 1500 });
        } catch {
            toast.error('Update failed', { position: "top-right" });
        } finally {
            setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
        }
    };

    const handleRemoveItem = async (cartItemId, productName) => {
        if (window.confirm(`Remove "${productName}" from cart?`)) {
            try {
                await removeCartItem(cartItemId);
                toast.success('Item removed', { position: "top-right", autoClose: 1500 });
            } catch {
                toast.error('Remove failed', { position: "top-right" });
            }
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear your entire cart?')) {
            try {
                await clearCart();
                toast.success('Cart cleared', { position: "top-right", autoClose: 1500 });
            } catch {
                toast.error('Clear failed', { position: "top-right" });
            }
        }
    };

    if (!cart) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!cart.items?.length) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <div className="flex-grow flex items-center justify-center py-12">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Your cart is empty
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Start shopping to add items to your cart
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Calculate totals
    const subtotal = cart.totalPrice || 0;
    const shipping = subtotal > 2000 ? 0 : 120;
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Shopping Cart
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                {getProductImage(item) ? (
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={getProductName(item)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                                {getProductName(item)}
                                            </h3>
                                            <p className="text-blue-600 dark:text-blue-400 font-semibold text-xl mb-3">
                                                ৳{getProductPrice(item).toFixed(2)}
                                            </p>

                                            {/* Attributes */}
                                            {(item.size || item.color) && (
                                                <div className="flex gap-2 mb-4 text-sm flex-wrap">
                                                    {item.size && (
                                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              Size: {item.size}
                            </span>
                                                    )}
                                                    {item.color && (
                                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                              Color: {item.color}
                            </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quantity and Actions */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={updatingItems[item.id] || item.quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 transition-colors"
                                                    >
                                                        <Minus size={16} className="text-gray-700 dark:text-gray-200" />
                                                    </button>

                                                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                            {updatingItems[item.id] ? '...' : item.quantity}
                          </span>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={updatingItems[item.id]}
                                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 transition-colors"
                                                    >
                                                        <Plus size={16} className="text-gray-700 dark:text-gray-200" />
                                                    </button>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-left sm:text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                                                    <p className="font-bold text-xl text-gray-900 dark:text-white">
                                                        ৳{(getProductPrice(item) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <div className="flex sm:flex-col justify-end">
                                            <button
                                                onClick={() => handleRemoveItem(item.id, getProductName(item))}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart Button */}
                            <button
                                onClick={handleClearCart}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-colors"
                            >
                                <Trash2 size={18} />
                                Clear Cart
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    Order Summary
                                </h2>

                                {/* Price Breakdown */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                      <Truck size={16} /> Shipping
                    </span>
                                        <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                      {shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}
                    </span>
                                    </div>

                                    {shipping > 0 && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            Add ৳{(2000 - subtotal).toFixed(2)} more for free shipping
                                        </p>
                                    )}

                                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                        <span>Tax (7%)</span>
                                        <span className="font-semibold">৳{tax.toFixed(2)}</span>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                            <span>Total</span>
                                            <span>৳{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="space-y-2 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Truck className="w-4 h-4 text-green-600" />
                                        <span>Free shipping over ৳2000</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <span>30-day return policy</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <CreditCard className="w-4 h-4 text-purple-600" />
                                        <span>Secure payment</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        to="/checkout"
                                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center transition-colors"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <Link
                                        to="/"
                                        className="block w-full text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CartPage;