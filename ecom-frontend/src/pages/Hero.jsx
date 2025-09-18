import { useState } from 'react';
import { ChevronRight, Star, Smartphone, ArrowRight } from 'lucide-react';
import CategorySidebar, {categories} from './CategorySidebar';

const Banner = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState(3);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-cyan-100 to-cyan-200 mx-4 my-6 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-8">
                    <div className="flex-1 space-y-4">
                        <h2 className="text-3xl font-bold text-cyan-800">Embrace Your Heritage</h2>
                        <h3 className="text-2xl font-bold text-gray-700">Wear Tradition with Style</h3>

                        <div className="flex items-center space-x-6 text-white">
                            <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Flat $5 Cashback</span>
                            </div>
                            <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Up to 20% Off</span>
                            </div>
                            <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Free Delivery</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <div className="w-64 h-48 bg-cyan-300 rounded-2xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-cyan-400"></div>
                            <div className="relative text-6xl">👘</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Categories Section */}
            <div className="px-6 py-8 relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Product Categories</h2>
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center space-x-1">
                        <span>See All</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Scroll Buttons */}
                <button
                    className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 text-base lg:text-lg xl:text-xl cursor-pointer flex items-center justify-center rounded-full bg-cyan-100 absolute left-0 top-1/2 transform -translate-y-1/2 hover:bg-cyan-500 hover:text-white transition duration-300 shadow-lg z-10"
                    onClick={() => document.getElementById('category-scroll').scrollBy({ left: -200, behavior: 'smooth' })}
                >
                    ◀
                </button>
                <button
                    className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 text-base lg:text-lg xl:text-xl cursor-pointer flex items-center justify-center rounded-full bg-cyan-100 absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-cyan-500 hover:text-white transition duration-300 shadow-lg z-10"
                    onClick={() => document.getElementById('category-scroll').scrollBy({ left: 200, behavior: 'smooth' })}
                >
                    ▶
                </button>

                {/* Scrollable Row */}
                <div
                    id="category-scroll"
                    className="flex space-x-6 overflow-x-auto scrollbar-hide px-3"
                >
                    {categories.map((category, index) => (
                        <div key={index} className={`${category.color} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 flex-shrink-0 w-40 flex flex-col items-center`}>
                            <div className={`w-16 h-16 ${category.color.split(' ')[0]} rounded-full flex items-center justify-center text-white text-2xl shadow-lg mb-4`}>
                                {category.icon}
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Products */}
            <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                                    <span className="text-4xl">👔</span>
                                </div>
                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    20% OFF
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">
                                    Product 500mg
                                </h3>
                                <div className="flex items-center space-x-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                                    ))}
                                    <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-x-2">
                                        <span className="text-lg font-bold text-gray-900">৳45</span>
                                        <span className="text-sm text-gray-500 line-through">৳60</span>
                                    </div>
                                    <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors text-sm">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Banner;
