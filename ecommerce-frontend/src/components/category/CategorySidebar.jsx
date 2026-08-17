import { ChevronRight, ChevronDown, Grid3X3, X, Sparkles } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function CategorySidebar({ categories = [] }) {
    const [openIndex, setOpenIndex] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleCategory = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubCategoryClick = (subCategoryId) => {
        navigate(`/subcategory/${subCategoryId}`);
        setIsMobileOpen(false);
    };

    const closeMobileMenu = () => setIsMobileOpen(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed top-6 left-6 z-50">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <Grid3X3 className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed lg:sticky top-0 left-0 h-screen w-80 
                bg-white dark:bg-gray-900 
                border-r border-purple-100 dark:border-gray-800
                shadow-2xl lg:shadow-none z-40
                transition-transform duration-500 ease-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full relative p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Categories
                            </h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Discover {categories.length} amazing categories
                        </p>
                    </div>

                    {/* Scrollable Categories Area */}
                    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar scroll-smooth">
                        {categories.map((category, index) => (
                            <div key={index} className="mb-3">
                                {/* Main Category Button */}
                                <button
                                    onClick={() => toggleCategory(index)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group
                                        ${openIndex === index
                                        ? 'bg-purple-50 border-purple-200 dark:bg-gray-800 dark:border-purple-700 shadow-md'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                                    }`}
                                >
                                    <div className="w-12 h-12 flex items-center justify-center text-3xl rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 transition-transform group-hover:scale-110">
                                        {category.icon}
                                    </div>

                                    <div className="flex-1 text-left">
                                        <span className="font-semibold text-gray-800 dark:text-white text-[17px]">
                                            {category.name}
                                        </span>
                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                                            {category.subCategories?.length || 0} items
                                        </p>
                                    </div>

                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-purple-600' : ''}`}
                                    />
                                </button>

                                {/* Subcategories */}
                                {openIndex === index && category.subCategories?.length > 0 && (
                                    <div className="ml-6 mt-3 space-y-1">
                                        {category.subCategories.map((sub, subIndex) => (
                                            <div
                                                key={subIndex}
                                                onClick={() => handleSubCategoryClick(sub.id)}
                                                className="px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                            >
                                                <span>{sub.name}</span>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-6 mt-auto border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
                                <Sparkles className="w-4 h-4" />
                                {categories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0)}+ Products
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
