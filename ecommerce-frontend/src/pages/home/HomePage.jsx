import {useEffect, useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
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

const HomePage = () => {
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

    const handleViewAllFeatured = () => navigate('/shop');

    const spinner = (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700 dark:border-emerald-400"/>
        </div>
    );

    const grid = (products) => (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {products.map(product => <ProductCard key={product.id} product={product}/>)}
        </div>
    );

    const sectionHeader = (title, onSeeAll, linkLabel = 'See All') => (
        <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white text-2xl sm:text-3xl tracking-tight">{title}</h2>
            {onSeeAll && (
                <button onClick={onSeeAll}
                        className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 whitespace-nowrap">
                    {linkLabel} <ArrowRight className="w-4 h-4"/>
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full px-3 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-24 sm:pb-16">
                {/* Hero banner */}
                <Banner/>

                {/* Shop by category: pill chips like a filter bar */}
                {categories.length > 0 && (
                    <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        <Link to="/shop"
                              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-emerald-900 text-white font-semibold text-sm sm:text-[15px] whitespace-nowrap hover:bg-emerald-800">
                            All Products
                        </Link>
                        {categories.map(cat => (
                            <Link key={cat.id} to={`/shop?category=${cat.id}`}
                                  className="flex items-center gap-2 pl-1.5 pr-4 sm:pr-5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-[15px] whitespace-nowrap hover:bg-emerald-50 hover:text-emerald-900 dark:hover:bg-gray-700 dark:hover:text-emerald-300 transition-colors">
                                <span className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    {cat.imageUrl
                                        ? <img src={cat.imageUrl} alt="" className="w-full h-full object-cover object-top"/>
                                        : <span className="text-base">{cat.icon}</span>}
                                </span>
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Recommended For You */}
                {isAuthenticated() && (recLoading || recommendations.length > 0) && (
                    <section className="mt-10 sm:mt-14">
                        {sectionHeader('Recommended For You')}
                        {recLoading ? spinner : grid(recommendations)}
                    </section>
                )}

                {/* Featured */}
                <section className="mt-10 sm:mt-14">
                    {sectionHeader('Products For You!', handleViewAllFeatured, 'View All')}
                    {productsLoading ? spinner : productsError ? (
                        <p className="text-center py-12 text-red-500 dark:text-red-400">Error loading products: {productsError}</p>
                    ) : featuredProducts.length === 0 ? (
                        <p className="text-center py-12 text-gray-500 dark:text-gray-400">No products available yet</p>
                    ) : grid(featuredProducts)}
                </section>

                {/* One section per category */}
                {categoryProductsLoading ? spinner : categoryProductsError ? (
                    <p className="text-center py-12 text-red-500 dark:text-red-400">Error loading category products: {categoryProductsError}</p>
                ) : categoryProducts.map(categoryData => (
                    <section key={categoryData.id} className="mt-12 sm:mt-16">
                        <div className="flex items-end justify-between gap-4 mb-6">
                            <button type="button" onClick={() => handleCategorySeeAll(categoryData.id)}
                                    className="group text-left min-w-0" title={`See all ${categoryData.name}`}>
                                <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 text-2xl sm:text-3xl tracking-tight truncate transition-colors">
                                    {categoryData.name}
                                </h2>
                            </button>
                            <button onClick={() => handleCategorySeeAll(categoryData.id)}
                                    className="flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-300 whitespace-nowrap">
                                See All <ArrowRight className="w-4 h-4"/>
                            </button>
                        </div>
                        {grid(categoryData.products)}
                    </section>
                ))}
            </div>
            <OfferPopup/>
        </div>
    );
};

export default HomePage;