import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    ArrowRight,
    Package,
    Truck,
    Shield,
    CreditCard,
    Star,
    Heart
} from 'lucide-react';
import {toast} from 'react-toastify';
import Footer from "../components/Footer";

const CartPage = () => {
    const {cart, updateCartItem, removeCartItem, clearCart} = useCart();
    const [updatingItems, setUpdatingItems] = useState({});
    const [savingItems, setSavingItems] = useState({});

    const getProductImage = (item) => item.product?.imageData || null;
    const getProductName = (item) => item.product?.name || "Product Not Available";
    const getProductPrice = (item) => item.product?.price || 0;

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItems(prev => ({...prev, [cartItemId]: true}));
        try {
            await updateCartItem(cartItemId, newQuantity);
            toast.success('Quantity updated!', {position: "top-right", autoClose: 1500});
        } catch {
            toast.error('Update failed', {position: "top-right"});
        } finally {
            setUpdatingItems(prev => ({...prev, [cartItemId]: false}));
        }
    };

    const handleRemoveItem = async (cartItemId, productName) => {
        if (window.confirm(`Remove "${productName}" from cart?`)) {
            try {
                await removeCartItem(cartItemId);
                toast.success(`${productName} removed!`, {position: "top-right", autoClose: 1500});
            } catch {
                toast.error('Remove failed', {position: "top-right"});
            }
        }
    };

    const handleSaveForLater = async (cartItemId, productName) => {
        setSavingItems(prev => ({...prev, [cartItemId]: true}));
        setTimeout(() => {
            setSavingItems(prev => ({...prev, [cartItemId]: false}));
            toast.info(`${productName} saved for later`, {position: "top-right", autoClose: 1500});
        }, 1000);
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear your entire shopping cart?')) {
            try {
                await clearCart();
                toast.success('Cart cleared!', {position: "top-right", autoClose: 1500});
            } catch {
                toast.error('Clear failed', {position: "top-right"});
            }
        }
    };

    if (!cart) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-center">
                        <div className="flex space-x-3 mb-4">
                            {[0, 1, 2].map(i => (
                                <div key={i}
                                     className={`w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce`}
                                     style={{animationDelay: `${i * 0.1}s`}}/>
                            ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your cart...</p>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }

    if (!cart.items?.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
                <div className="flex-grow flex items-center justify-center py-12">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20 dark:border-gray-700/50">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <ShoppingBag className="w-16 h-16 text-cyan-600 dark:text-cyan-400"/>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                                Your Cart Awaits
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                                Discover amazing products and fill your cart with items you'll love
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                            >
                                <Package className="w-5 h-5"/>
                                Start Shopping Journey
                                <ArrowRight className="w-5 h-5"/>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>
        );
    }

    // Calculate order details
    const subtotal = cart.totalPrice || 0;
    const shipping = subtotal > 2000 ? 0 : 120;
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + shipping + tax;
    const freeShippingProgress = Math.min((subtotal / 2000) * 100, 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-grow py-12">
                <div className="container mx-auto px-6 max-w-8xl">
                    {/* Enhanced Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Your Shopping Cart
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                            {cart.totalItems} premium {cart.totalItems === 1 ? 'item' : 'items'} carefully selected
                        </p>
                        <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Cart Items - Enhanced */}
                        <div className="xl:col-span-3 space-y-6">
                            {/* Progress Bar for Free Shipping */}
                            {shipping > 0 && (
                                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Add ৳{(2000 - subtotal).toFixed(2)} for FREE shipping!
                                        </span>
                                        <span className="text-sm font-bold text-green-600">{freeShippingProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{width: `${freeShippingProgress}%`}}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {cart.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 border border-white/20 dark:border-gray-700/50 transform hover:scale-[1.02]"
                                    style={{
                                        animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                                    }}
                                >
                                    <div className="flex items-start gap-8">
                                        {/* Enhanced Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden shadow-2xl relative group">
                                                {getProductImage(item) ? (
                                                    <img
                                                        src={getProductImage(item)}
                                                        alt={getProductName(item)}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-12 h-12 text-gray-400"/>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
                                                        <span>4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Product Details */}
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100 mb-3 leading-tight">
                                                {getProductName(item)}
                                            </h3>
                                            <p className="text-cyan-600 dark:text-cyan-400 font-black text-3xl mb-4">
                                                ৳{getProductPrice(item).toFixed(2)}
                                            </p>

                                            <div className="flex gap-3 mb-4">
                                                {item.size && (
                                                    <span className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-xl font-medium text-sm border border-cyan-200 dark:border-cyan-800">
                                                        Size: {item.size}
                                                    </span>
                                                )}
                                                {item.color && (
                                                    <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium text-sm border border-purple-200 dark:border-purple-800">
                                                        Color: {item.color}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Enhanced Quantity Controls */}
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2 shadow-inner">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={updatingItems[item.id] || item.quantity <= 1}
                                                        className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-600 rounded-xl disabled:opacity-30 hover:bg-cyan-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    >
                                                        <Minus size={20} className="text-gray-700 dark:text-gray-200"/>
                                                    </button>

                                                    <span className="w-16 text-center font-black text-2xl text-gray-800 dark:text-gray-200">
                                                        {updatingItems[item.id] ? '...' : item.quantity}
                                                    </span>

                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={updatingItems[item.id]}
                                                        className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-600 rounded-xl disabled:opacity-30 hover:bg-cyan-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                                                    >
                                                        <Plus size={20} className="text-gray-700 dark:text-gray-200"/>
                                                    </button>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                                                    <p className="font-black text-3xl text-gray-900 dark:text-white">
                                                        ৳{(getProductPrice(item) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => handleRemoveItem(item.id, getProductName(item))}
                                                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                            >
                                                <Trash2 size={18}/>
                                                Remove
                                            </button>

                                            <button
                                                onClick={() => handleSaveForLater(item.id, getProductName(item))}
                                                disabled={savingItems[item.id]}
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                                            >
                                                <Heart size={18}/>
                                                {savingItems[item.id] ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced Order Summary */}
                        <div className="xl:col-span-1">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20 dark:border-gray-700/50">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8 text-center">
                                    Order Summary
                                </h3>

                                {/* Pricing Breakdown */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
                                        <span className="font-black text-2xl text-gray-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-lg">
                                        <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Truck size={18}/> Shipping
                                        </span>
                                        <span className={`font-black text-2xl ${shipping === 0 ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
                                            {shipping === 0 ? "FREE" : `৳${shipping.toFixed(2)}`}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-gray-700 dark:text-gray-300">Tax (7%)</span>
                                        <span className="font-black text-2xl text-gray-900 dark:text-white">৳{tax.toFixed(2)}</span>
                                    </div>

                                    <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4 mt-6">
                                        <div className="flex justify-between items-center text-2xl">
                                            <span className="font-black text-gray-900 dark:text-white">Total</span>
                                            <span className="font-black text-3xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                                ৳{total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Truck className="w-5 h-5 text-green-600"/>
                                        <span className="text-green-700 dark:text-green-300 font-medium">Free shipping over ৳2000</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Shield className="w-5 h-5 text-blue-600"/>
                                        <span className="text-blue-700 dark:text-blue-300 font-medium">30-day return policy</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <CreditCard className="w-5 h-5 text-purple-600"/>
                                        <span className="text-purple-700 dark:text-purple-300 font-medium">Secure payment</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4">
                                    <Link
                                        to="/checkout"
                                        className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-5 px-6 rounded-2xl font-black text-lg text-center transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                                    >
                                        PROCEED TO CHECKOUT
                                    </Link>

                                    <button
                                        onClick={handleClearCart}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                                    >
                                        <Trash2 size={20}/>
                                        Clear Entire Cart
                                    </button>

                                    <Link
                                        to="/"
                                        className="block w-full text-center border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 py-4 px-6 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer/>
        </div>
    );
};

export default CartPage;