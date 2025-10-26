import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Moon, Sun } from 'lucide-react';

export default function CartPage() {
    const [isDark, setIsDark] = useState(false);
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: 'Premium Wireless Headphones',
            price: 12999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
            color: 'Matte Black',
            size: 'Standard'
        },
        {
            id: 2,
            name: 'Smart Watch Series 8',
            price: 24999,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            color: 'Space Gray',
            size: '42mm'
        },
        {
            id: 3,
            name: 'Leather Laptop Bag',
            price: 8499,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
            color: 'Brown',
            size: '15 inch'
        }
    ]);

    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const updateQuantity = (id, change) => {
        setCartItems(items =>
            items.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + change) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const applyPromo = () => {
        if (promoCode.toUpperCase() === 'SAVE10') {
            setDiscount(10);
        } else if (promoCode.toUpperCase() === 'SAVE20') {
            setDiscount(20);
        } else {
            setDiscount(0);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 20000 ? 0 : 150;
    const discountAmount = (subtotal * discount) / 100;
    const vat = Math.round(subtotal * 0.15);
    const total = subtotal + shipping - discountAmount + vat;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDark
                ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
                : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
        }`}>
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            <ShoppingBag className="text-indigo-500" size={36} />
                            Shopping Cart
                        </h1>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                            isDark
                                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
                        }`}
                    >
                        {isDark ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border ${
                                    isDark
                                        ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                                        : 'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex gap-6">
                                    <div className="relative group">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-32 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-2 ${
                                                isDark ? 'text-white' : 'text-gray-900'
                                            }`}>{item.name}</h3>
                                            <div className={`flex gap-4 text-sm mb-3 ${
                                                isDark ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                        <span className="flex items-center gap-1">
                          <span className={`w-4 h-4 rounded-full border-2 ${
                              isDark ? 'bg-gray-600 border-gray-500' : 'bg-gray-300 border-white'
                          }`}></span>
                            {item.color}
                        </span>
                                                <span>Size: {item.size}</span>
                                            </div>
                                            <p className="text-xl font-bold text-indigo-500">
                                                ৳{item.price.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className={`flex items-center gap-3 rounded-xl p-2 ${
                                                isDark ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm ${
                                                        isDark
                                                            ? 'bg-gray-600 hover:bg-indigo-600 text-white'
                                                            : 'bg-white hover:bg-indigo-600 hover:text-white'
                                                    }`}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className={`w-8 text-center font-semibold ${
                                                    isDark ? 'text-white' : 'text-gray-900'
                                                }`}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm ${
                                                        isDark
                                                            ? 'bg-gray-600 hover:bg-indigo-600 text-white'
                                                            : 'bg-white hover:bg-indigo-600 hover:text-white'
                                                    }`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    isDark
                                                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                                                        : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                                }`}
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cartItems.length === 0 && (
                            <div className={`rounded-2xl shadow-sm p-12 text-center ${
                                isDark ? 'bg-gray-800' : 'bg-white'
                            }`}>
                                <ShoppingBag className={`mx-auto mb-4 ${
                                    isDark ? 'text-gray-600' : 'text-gray-300'
                                }`} size={64} />
                                <h3 className={`text-xl font-semibold mb-2 ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                }`}>Your cart is empty</h3>
                                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    Add some items to get started!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className={`rounded-2xl shadow-lg p-6 sticky top-8 border ${
                            isDark
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-100'
                        }`}>
                            <h2 className={`text-2xl font-bold mb-6 ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}>Order Summary</h2>

                            {/* Item Count */}
                            <div className={`rounded-xl p-4 mb-6 ${
                                isDark
                                    ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50'
                                    : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                            }`}>
                                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Total Items</span>
                                    <span className={`text-lg font-bold ${
                                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                                    }`}>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                                    isDark ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                    <Tag size={16} className="text-indigo-500" />
                                    Have a Promo Code?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter code"
                                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                                            isDark
                                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                    <button
                                        onClick={applyPromo}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium whitespace-nowrap"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {discount > 0 && (
                                    <div className={`mt-2 p-2 border rounded-lg ${
                                        isDark
                                            ? 'bg-green-900/30 border-green-700'
                                            : 'bg-green-50 border-green-200'
                                    }`}>
                                        <p className={`text-sm font-medium flex items-center gap-1 ${
                                            isDark ? 'text-green-400' : 'text-green-700'
                                        }`}>
                                            <span className="text-green-500">✓</span> {discount}% discount applied!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Price Breakdown */}
                            <div className={`space-y-3 mb-6 pb-6 border-b ${
                                isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <div className={`flex justify-between text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span className={`font-medium ${
                                        isDark ? 'text-gray-200' : 'text-gray-900'
                                    }`}>৳{subtotal.toLocaleString()}</span>
                                </div>

                                <div className={`flex justify-between text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                  <span className="flex items-center gap-1">
                    Shipping Fee
                      {shipping === 0 && <span className="text-xs text-green-500">(Free)</span>}
                  </span>
                                    <span className="font-medium">
                    {shipping === 0 ? (
                        <span className="text-green-500 font-semibold">Free</span>
                    ) : (
                        <span className={isDark ? 'text-gray-200' : 'text-gray-900'}>৳{shipping}</span>
                    )}
                  </span>
                                </div>

                                <div className={`flex justify-between text-sm ${
                                    isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    <span>VAT (15%)</span>
                                    <span className={`font-medium ${
                                        isDark ? 'text-gray-200' : 'text-gray-900'
                                    }`}>৳{vat.toLocaleString()}</span>
                                </div>

                                {discount > 0 && (
                                    <div className={`flex justify-between text-sm -mx-2 px-2 py-2 rounded-lg ${
                                        isDark
                                            ? 'text-green-400 bg-green-900/30'
                                            : 'text-green-600 bg-green-50'
                                    }`}>
                                        <span className="font-medium">Discount ({discount}%)</span>
                                        <span className="font-semibold">-৳{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className={`flex justify-between text-sm -mx-2 px-2 py-2 rounded-lg ${
                                        isDark
                                            ? 'text-amber-400 bg-amber-900/30'
                                            : 'text-amber-600 bg-amber-50'
                                    }`}>
                                        <span className="font-medium">You're Saving</span>
                                        <span className="font-semibold">৳{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className={`flex justify-between items-center mb-6 pb-6 border-b ${
                                isDark ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                                <div>
                  <span className={`text-lg font-semibold block ${
                      isDark ? 'text-white' : 'text-gray-900'
                  }`}>Total Amount</span>
                                    <span className={`text-xs ${
                                        isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Including VAT</span>
                                </div>
                                <span className={`text-2xl font-bold ${
                                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                                }`}>
                  ৳{total.toLocaleString()}
                </span>
                            </div>

                            {/* Estimated Delivery */}
                            <div className={`border rounded-xl p-4 mb-6 ${
                                isDark
                                    ? 'bg-blue-900/30 border-blue-800'
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-600 rounded-full p-2">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className={`font-semibold text-sm ${
                                            isDark ? 'text-blue-300' : 'text-blue-900'
                                        }`}>Estimated Delivery</p>
                                        <p className={`text-xs mt-1 ${
                                            isDark ? 'text-blue-400' : 'text-blue-700'
                                        }`}>3-5 Business Days</p>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                                Proceed to Checkout
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </button>

                            {/* Free Shipping Progress */}
                            {shipping > 0 && (
                                <div className={`mt-4 p-4 rounded-xl border ${
                                    isDark
                                        ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-800'
                                        : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                                }`}>
                                    <p className={`text-xs font-medium mb-2 ${
                                        isDark ? 'text-orange-300' : 'text-orange-800'
                                    }`}>
                                        Add ৳{(20000 - subtotal).toLocaleString()} more for FREE shipping! 🚚
                                    </p>
                                    <div className={`w-full rounded-full h-2 ${
                                        isDark ? 'bg-orange-900' : 'bg-orange-200'
                                    }`}>
                                        <div
                                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min((subtotal / 20000) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Secure Checkout Badge */}
                            <div className={`mt-4 flex items-center justify-center gap-2 text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}