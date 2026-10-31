import {useEffect, useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import CategorySidebar from '../../components/category/CategorySidebar';
import {getActiveBanners} from "../../api/bannerApi";
import Banner from "../../components/banner/Banner";
import {useCategories} from "../../hooks/useCategory";
import ProductCard from "../../components/product/ProductCard";
import {useProducts} from "../../hooks/useProducts";
import {useCategoryProducts} from "../../hooks/useCategoryProducts";
import {toast} from "react-toastify";
import OfferPopup from "../../components/common/OfferPopup";
import { useRecommendations } from "../../hooks/useRecommendations";
import { isAuthenticated } from "../../api/authApi";
import {useLanguage} from '../../context/LanguageContext';

const HomePage = () => {
    const {t} = useLanguage();
    const navigate = useNavigate();
    const {categories} = useCategories();
    const {products: featuredProducts, loading: productsLoading, error: productsError} = useProducts(8);
    const {categoryProducts, loading: categoryProductsLoading, error: categoryProductsError} = useCategoryProducts(4);
    const [banners, setBanners] = useState([]);
    const [isLoadingBanners, setIsLoadingBanners] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { recommendations, loading: recLoading } = useRecommendations();

    useEffect(() => {
        const error = searchParams.get("error");
        if (error === "deactivated") {
            toast.error("Your account has been deactivated. Please contact support.");
            setSearchParams({});
        }
    }, []);

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

    // Category titles and "See All" open the Shop page filtered to that category
    const handleCategorySeeAll = (categoryId) => {
        navigate(`/shop?category=${categoryId}`);
    };

    const handleViewAllFeatured = () => {
        if (categories.length > 0) {
            navigate(`/category/${categories[0].id}`, {
                state: {categoryName: categories[0].name}
            });
        }
    };

    return (
        <div className="dark:bg-gray-900 transition-colors duration-300">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <CategorySidebar categories={categories}/>
                    </div>

                    {/* Scrollable Main Content (min-w-0 stops wide images from stretching the page) */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* Main Content */}
                        <div
                            className="flex-grow bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
                            {/* Hero Banner Section */}
                            <Banner/>

                            {/* Recommended For You */}
                            {isAuthenticated() && (
                                <div className="px-3 sm:px-6 py-5 sm:py-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">✨</span>
                                            <h2 className="font-bold text-gray-900 dark:text-white text-xl sm:text-2xl">
                                                {t('home.recommended')}
                                            </h2>
                                        </div>
                                    </div>

                                    {recLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"/>
                                        </div>
                                    ) : recommendations.length === 0 ? null : (
                                        <div className="gap-3 sm:gap-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {recommendations.map(product => (
                                                <ProductCard key={product.id} product={product}/>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Featured Products */}
                            <div className="px-3 sm:px-6 py-5 sm:py-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-gray-900 dark:text-white text-xl sm:text-2xl transition-colors duration-300">
                                        {t('home.featured')}
                                    </h2>
                                    <button
                                        onClick={handleViewAllFeatured}
                                        className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300"
                                    >
                                        <span>{t('home.viewAll')}</span>
                                        <ArrowRight className="w-4 h-4"/>
                                    </button>
                                </div>

                                {productsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
                                    </div>
                                ) : productsError ? (
                                    <div
                                        className="text-center py-12 text-red-500 dark:text-red-400 transition-colors duration-300">
                                        Error loading products: {productsError}
                                    </div>
                                ) : featuredProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        {t('home.noFeatured')}
                                    </div>
                                ) : (
                                    <div
                                        className="gap-3 sm:gap-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                            <div className="px-3 sm:px-6 py-5 sm:py-8 pb-24 sm:pb-16">
                                {categoryProductsLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
                                    </div>
                                ) : categoryProductsError ? (
                                    <div
                                        className="text-center py-12 text-red-500 dark:text-red-400 transition-colors duration-300">
                                        Error loading category products: {categoryProductsError}
                                    </div>
                                ) : categoryProducts.length === 0 ? (
                                    <div
                                        className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        {t('home.noProducts')}
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {categoryProducts.map((categoryData) => (
                                            <div key={categoryData.id} className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCategorySeeAll(categoryData.id)}
                                                        className="group flex items-center gap-3 min-w-0 text-left"
                                                        title={`See all ${categoryData.name}`}
                                                    >
                                                        {categoryData.icon && (
                                                            <div
                                                                className={`w-10 h-10 ${categoryData.color} rounded-full flex items-center justify-center text-white text-xl`}>
                                                                {categoryData.icon}
                                                            </div>
                                                        )}
                                                        <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 text-xl sm:text-2xl truncate transition-colors duration-300">
                                                            {categoryData.name}
                                                        </h2>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCategorySeeAll(categoryData.id)}
                                                        className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300"
                                                    >
                                                        <span>{t('home.seeAll')}</span>
                                                        <ArrowRight className="w-4 h-4"/>
                                                    </button>
                                                </div>

                                                <div
                                                    className="gap-3 sm:gap-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            </div>
            <OfferPopup/>
        </div>
    );
};

export default HomePage;