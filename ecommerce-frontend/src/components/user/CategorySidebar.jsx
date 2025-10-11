import { ChevronRight, ChevronDown, Grid3X3, X } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function CategorySidebar({ categories = [] }) {
    const [openIndex, setOpenIndex] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();

    const toggleCategory = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubCategoryClick = (subCategoryId) => {
        navigate(`/subcategory/${subCategoryId}`);
        setIsMobileOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Floating Mobile Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-50">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
                >
                    <Grid3X3 className="w-6 h-6" />
                </button>
            </div>

            {/* Animated Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Glass Morphism Sidebar */}
            <div className={`
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
                lg:translate-x-0
                fixed lg:sticky top-0 left-0 
                w-80 lg:w-72 
                h-screen 
                bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl
                border-r border-white/20
                z-40 
                transition-all duration-500 ease-out
                overflow-y-auto
            `}>
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200/20 rounded-full -translate-x-20 translate-y-20 blur-2xl"></div>

                <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex justify-between items-center mb-8 pb-4 border-b border-white/30">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Categories
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Browse our collection</p>
                        </div>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-8">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            All Categories
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">{categories.length} categories available</p>
                    </div>

                    {/* Categories List */}
                    <div className="flex-1 space-y-2">
                        {categories.map((category, index) => (
                            <div key={index} className="group">
                                <button
                                    onClick={() => toggleCategory(index)}
                                    className="w-full flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-white/50 transition-all duration-300 hover:shadow-lg group-hover:scale-[1.02]"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        {category.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors">
                                            {category.name}
                                        </span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {category.subCategories?.length || 0} subcategories
                                        </div>
                                    </div>
                                    <div className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                        {openIndex === index ? (
                                            <ChevronDown className="h-5 w-5 text-cyan-600" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-500" />
                                        )}
                                    </div>
                                </button>

                                {/* Animated Subcategories */}
                                {openIndex === index && (
                                    <div className="ml-16 mt-2 space-y-2 animate-slideDown">
                                        {category.subCategories?.map((sub, subIndex) => (
                                            <div
                                                key={subIndex}
                                                onClick={() => handleSubCategoryClick(sub.id)}
                                                className={`px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/50 ${sub.color} hover:border-white/80`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700 hover:text-gray-900">
                                                        {sub.name}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-white/30 mt-4">
                        <div className="text-center text-xs text-gray-500">
                            <p>Browse {categories.reduce((acc, cat) => acc + (cat.subCategories?.length || 0), 0)}+ products</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}