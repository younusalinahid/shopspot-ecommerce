import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import CategorySidebar from './user/CategorySidebar';
import { getActiveBanners } from "../api/banner-api-service";
import Footer from "../components/Footer";
import Banner from "./user/Banner";
import { useCategories } from "../hooks/useCategory";
import ProductCard from "./user/productCard";
import { useProducts } from "../hooks/useProducts";
import { useCategoryProducts } from "../hooks/useCategoryProducts";

const Home = () => {
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const { products: featuredProducts, loading: productsLoading, error: productsError } = useProducts(8);
    const { categoryProducts, loading: categoryProductsLoading, error: categoryProductsError } = useCategoryProducts(4);
    const [banners, setBanners] = useState([]);
    const [isLoadingBanners, setIsLoadingBanners] = useState(true);

    useEffect(() => {
        getActiveBanners()
            .then(data => {
                const activeBanners = data
                    .filter(banner => banner.active)
                    .sort((a, b) => a.orderIndex - b.orderIndex);
                setBanners(activeBanners);
                setIsLoadingBanners(false);
            })
            .catch(err => {
                setIsLoadingBanners(false);
            });
    }, []);

    const getCategoryCardStyles = (colorClass) => {
        const darkColors = {
            'bg-blue-100': 'dark:bg-blue-900/40 dark:shadow-blue-500/20',
            'bg-green-100': 'dark:bg-green-900/40 dark:shadow-green-500/20',
            'bg-red-100': 'dark:bg-red-900/40 dark:shadow-red-500/20',
            'bg-yellow-100': 'dark:bg-yellow-900/40 dark:shadow-yellow-500/20',
            'bg-purple-100': 'dark:bg-purple-900/40 dark:shadow-purple-500/20',
            'bg-pink-100': 'dark:bg-pink-900/40 dark:shadow-pink-500/20',
            'bg-indigo-100': 'dark:bg-indigo-900/40 dark:shadow-indigo-500/20',
            'bg-cyan-100': 'dark:bg-cyan-900/40 dark:shadow-cyan-500/20',
            'bg-gray-100': 'dark:bg-gray-800/60 dark:shadow-gray-500/20',
            'bg-orange-100': 'dark:bg-orange-900/40 dark:shadow-orange-500/20',
        };

        return `${colorClass} ${darkColors[colorClass] || 'dark:bg-gray-800 dark:shadow-gray-500/20'}`;
    };

    const handleCategoryScroll = (direction) => {
        const scrollContainer = document.getElementById('category-scroll');
        if (scrollContainer) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="dark:bg-gray-900 transition-colors duration-300">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <CategorySidebar categories={categories} />
                    </div>

                    {/* Scrollable Main Content */}
                    <div className="flex-1 flex flex-col">
                        {/* Main Content */}
                        <div className="flex-grow bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
                            {/* Hero Banner Section */}
                            <Banner />

                            {/* Product Categories Section */}
                            <div className="relative px-6 py-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-gray-900 dark:text-white text-2xl transition-colors duration-300">
                                        Product Categories
                                    </h2>
                                    <button
                                        className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300"
                                    >
                                        <span>See All</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Scroll Buttons */}
                                <button
                                    className="top-1/2 left-0 z-10 absolute flex justify-center items-center bg-cyan-100 hover:bg-cyan-500 dark:bg-gray-700 dark:hover:bg-cyan-600 shadow-lg rounded-full w-7 md:w-8 lg:w-9 xl:w-10 h-7 md:h-8 lg:h-9 xl:h-10 hover:text-white dark:text-gray-300 dark:hover:text-white text-base lg:text-lg xl:text-xl transition-all duration-300 cursor-pointer transform -translate-y-1/2"
                                    onClick={() => handleCategoryScroll('left')}
                                    aria-label="Scroll left"
                                >
                                    ◀
                                </button>
                                <button
                                    className="top-1/2 right-0 z-10 absolute flex justify-center items-center bg-cyan-100 hover:bg-cyan-500 dark:bg-gray-700 dark:hover:bg-cyan-600 shadow-lg rounded-full w-7 md:w-8 lg:w-9 xl:w-10 h-7 md:h-8 lg:h-9 xl:h-10 hover:text-white dark:text-gray-300 dark:hover:text-white text-base lg:text-lg xl:text-xl transition-all duration-300 cursor-pointer transform -translate-y-1/2"
                                    onClick={() => handleCategoryScroll('right')}
                                    aria-label="Scroll right"
                                >
                                    ▶
                                </button>

                                {/* Scrollable Row */}
                                <div className="relative overflow-hidden">
                                    {categoriesLoading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
                                        </div>
                                    ) : categoriesError ? (
                                        <div className="text-center py-12 text-red-500 dark:text-red-400">
                                            Error loading categories
                                        </div>
                                    ) : (
                                        <div
                                            id="category-scroll"
                                            className="flex space-x-6 px-3 overflow-x-auto scroll-smooth snap-mandatory snap-x scrollbar-hide"
                                            style={{
                                                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                                                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                                            }}
                                        >
                                            {categories.map((category) => (
                                                <div
                                                    key={category.id}
                                                    className={`${getCategoryCardStyles(category.color)} rounded-2xl p-6 text-center hover:shadow-lg dark:hover:shadow-lg transition-all duration-300 flex-shrink-0 w-[calc((100%-6rem)/6)] min-w-[150px] snap-start flex flex-col items-center cursor-pointer`}
                                                >
                                                    <div
                                                        className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg mb-4 transition-colors duration-300`}
                                                    >
                                                        {category.icon}
                                                    </div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm transition-colors duration-300">
                                                        {category.name}
                                                    </h3>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Featured Products */}
                            <div className="px-6 py-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-gray-900 dark:text-white text-2xl transition-colors duration-300">
                                        Featured Products
                                    </h2>
                                    <button
                                        className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300"
                                    >
                                        <span>View All</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {productsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
                                    </div>
                                ) : productsError ? (
                                    <div className="text-center py-12 text-red-500 dark:text-red-400 transition-colors duration-300">
                                        Error loading products: {productsError}
                                    </div>
                                ) : featuredProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        No featured products available
                                    </div>
                                ) : (
                                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {featuredProducts.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Category-wise Products */}
                            <div className="px-6 py-8 pb-16">
                                {categoryProductsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
                                    </div>
                                ) : categoryProductsError ? (
                                    <div className="text-center py-12 text-red-500 dark:text-red-400 transition-colors duration-300">
                                        Error loading category products: {categoryProductsError}
                                    </div>
                                ) : categoryProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        No products available at the moment
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {categoryProducts.map((categoryData) => (
                                            <div key={categoryData.id} className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        {categoryData.icon && (
                                                            <div className={`w-10 h-10 ${categoryData.color} rounded-full flex items-center justify-center text-white text-xl`}>
                                                                {categoryData.icon}
                                                            </div>
                                                        )}
                                                        <h2 className="font-bold text-gray-900 dark:text-white text-2xl transition-colors duration-300">
                                                            {categoryData.name}
                                                        </h2>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                        }}
                                                        className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300"
                                                    >
                                                        <span>See All</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                    {categoryData.products.map((product) => (
                                                        <ProductCard
                                                            key={product.id}
                                                            product={product}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default Home;