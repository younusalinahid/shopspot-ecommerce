import { ChevronRight, ChevronDown, Grid3X3, X, Sparkles } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function CategorySidebar({ categories = [] }) {
    const [openIndex, setOpenIndex] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
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

    const closeMobileMenu = () => {
        setIsMobileOpen(false);
    };

    const getSubCategoryStyles = (colorClass) => {
        const styles = {
            'bg-blue-100': 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 dark:from-blue-950/50 dark:to-blue-900/50 dark:text-blue-300 dark:border-blue-800/50 dark:hover:from-blue-900/70 dark:hover:to-blue-800/70',
            'bg-green-100': 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200 dark:from-green-950/50 dark:to-green-900/50 dark:text-green-300 dark:border-green-800/50 dark:hover:from-green-900/70 dark:hover:to-green-800/70',
            'bg-red-100': 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200 dark:from-red-950/50 dark:to-red-900/50 dark:text-red-300 dark:border-red-800/50 dark:hover:from-red-900/70 dark:hover:to-red-800/70',
            'bg-yellow-100': 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200 dark:from-yellow-950/50 dark:to-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800/50 dark:hover:from-yellow-900/70 dark:hover:to-yellow-800/70',
            'bg-purple-100': 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-purple-200 dark:from-purple-950/50 dark:to-purple-900/50 dark:text-purple-300 dark:border-purple-800/50 dark:hover:from-purple-900/70 dark:hover:to-purple-800/70',
            'bg-pink-100': 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 border-pink-200 hover:from-pink-100 hover:to-pink-200 dark:from-pink-950/50 dark:to-pink-900/50 dark:text-pink-300 dark:border-pink-800/50 dark:hover:from-pink-900/70 dark:hover:to-pink-800/70',
            'bg-indigo-100': 'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200 dark:from-indigo-950/50 dark:to-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800/50 dark:hover:from-indigo-900/70 dark:hover:to-indigo-800/70',
            'bg-cyan-100': 'bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200 hover:from-cyan-100 hover:to-cyan-200 dark:from-cyan-950/50 dark:to-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800/50 dark:hover:from-cyan-900/70 dark:hover:to-cyan-800/70',
            'bg-orange-100': 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-orange-200 dark:from-orange-950/50 dark:to-orange-900/50 dark:text-orange-300 dark:border-orange-800/50 dark:hover:from-orange-900/70 dark:hover:to-orange-800/70',
            'bg-gray-100': 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800/50 dark:to-gray-700/50 dark:text-gray-300 dark:border-gray-600/50 dark:hover:from-gray-700/70 dark:hover:to-gray-600/70',
        };
        return styles[colorClass] || styles['bg-gray-100'];
    };

    const getCategoryCardStyles = (colorClass) => {
        const styles = {
            'bg-blue-100': 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40',
            'bg-green-100': 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40',
            'bg-red-100': 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40',
            'bg-yellow-100': 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40',
            'bg-purple-100': 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40',
            'bg-pink-100': 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-800/40',
            'bg-indigo-100': 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40',
            'bg-cyan-100': 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/40 dark:to-cyan-800/40',
            'bg-orange-100': 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
            'bg-gray-100': 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40',
        };
        return styles[colorClass] || styles['bg-gray-100'];
    };

    return (
        <>
            {/* Floating Mobile Menu Button */}
            <div className="lg:hidden fixed top-6 left-6 z-50">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:shadow-indigo-500/50 hover:shadow-2xl group"
                >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Grid3X3 className="w-6 h-6 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

            {/* Animated Backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-40 animate-fadeIn"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Enhanced Sidebar */}
            <div className={`
                ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
                lg:translate-x-0
                fixed lg:sticky top-0 left-0 
                w-80 lg:w-80 
                h-screen 
                bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800
                border-r border-purple-200/50 dark:border-purple-900/30
                z-40 
                transition-all duration-500 ease-out
                overflow-hidden
                ${isScrolled ? 'lg:shadow-xl' : ''}
            `}>
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full -translate-y-32 translate-x-32 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-indigo-300/30 to-cyan-300/30 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-full -translate-x-28 translate-y-28 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex justify-between items-center mb-6 pb-4 border-b border-purple-200/50 dark:border-purple-800/30">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                                Categories
                                <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 animate-pulse" />
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore our collection</p>
                        </div>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-90"
                        >
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:block mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                                All Categories
                            </h2>
                            <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 animate-pulse" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Discover {categories.length} amazing categories
                        </p>
                    </div>

                    {/* Categories List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar dark:custom-scrollbar-dark pr-2">
                        {categories.map((category, index) => (
                            <div key={index} className="mb-4 animate-slideIn" style={{ animationDelay: `${index * 0.05}s` }}>
                                <button
                                    onClick={() => toggleCategory(index)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 group
                                        ${openIndex === index
                                        ? 'bg-white/80 dark:bg-gray-800/80 border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30'
                                        : 'bg-white/50 dark:bg-gray-800/50 border-transparent hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-purple-200 dark:hover:border-purple-800/50 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl ${getCategoryCardStyles(category.color)} flex items-center justify-center text-2xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        {category.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-semibold text-gray-800 dark:text-gray-100 block group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-300">
                                            {category.name}
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                                                {category.subCategories?.length || 0} items
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`transition-all duration-300 ${openIndex === index ? 'rotate-180 scale-110' : 'scale-100'}`}>
                                        <ChevronDown className={`h-5 w-5 ${openIndex === index ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-500'}`} />
                                    </div>
                                </button>

                                {/* Animated Subcategories */}
                                {openIndex === index && category.subCategories && (
                                    <div className="ml-4 mt-3 space-y-2 animate-slideDown">
                                        {category.subCategories.map((sub, subIndex) => (
                                            <div
                                                key={subIndex}
                                                onClick={() => handleSubCategoryClick(sub.id)}
                                                className={`px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md backdrop-blur-sm border-2 ${getSubCategoryStyles(sub.color)} animate-slideIn group`}
                                                style={{ animationDelay: `${subIndex * 0.05}s` }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="transition-all duration-300 group-hover:translate-x-1">
                                                        {sub.name}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="pt-6 border-t border-purple-200/50 dark:border-purple-800/30">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-sm font-medium text-purple-700 dark:text-purple-300">
                                <Sparkles className="w-4 h-4" />
                                <span>{categories.reduce((acc, cat) => acc + (cat.subCategories?.length || 0), 0)}+ products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}