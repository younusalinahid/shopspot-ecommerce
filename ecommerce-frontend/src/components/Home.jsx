import {useEffect, useState} from 'react';
import {Star, ArrowRight} from 'lucide-react';
import CategorySidebar from './user/CategorySidebar';
import {getAllBanners} from "../api/banner-api-service";
import Footer from "../components/Footer";
import Banner from "./user/Banner";
import {useCategories} from "../hooks/useCategory";
import ProductCard from "./user/product-card";
import {useProducts} from "../hooks/useProducts";

const Home = () => {
    const {categories, loading: categoriesLoading, error: categoriesError} = useCategories();
    const { products: featuredProducts, loading: productsLoading, error: productsError } = useProducts(8);
    const [banners, setBanners] = useState([])
    const [isLoadingBanners, setIsLoadingBanners] = useState(true)

    useEffect(() => {
        // Load banners
        getAllBanners()
            .then(data => {
                const activeBanners = data
                    .filter(banner => banner.active)
                    .sort((a, b) => a.orderIndex - b.orderIndex);
                setBanners(activeBanners);
                setIsLoadingBanners(false);
            })
            .catch(err => {
                console.error('Error loading banners:', err);
                setIsLoadingBanners(false);
            });
    }, []);

    return (
        <div>
            <div className="min-h-screen flex">
                {/* Fixed Sidebar */}
                <div className="w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white shadow-lg">
                    <CategorySidebar categories={categories}/>
                </div>

                {/* Scrollable Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Main Content */}
                    <div className="flex-grow bg-gray-50 overflow-y-auto">
                        {/* Hero Banner Section */}
                        <Banner/>

                        {/* Product Categories Section */}
                        <div className="relative px-6 py-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-gray-900 text-2xl">Product Categories</h2>
                                <button
                                    className="flex items-center space-x-1 font-medium text-cyan-600 hover:text-cyan-700">
                                    <span>See All</span>
                                    <ArrowRight className="w-4 h-4"/>
                                </button>
                            </div>

                            {/* Scroll Buttons */}
                            <button
                                className="top-1/2 left-0 z-10 absolute flex justify-center items-center bg-cyan-100 hover:bg-cyan-500 shadow-lg rounded-full w-7 md:w-8 lg:w-9 xl:w-10 h-7 md:h-8 lg:h-9 xl:h-10 hover:text-white text-base lg:text-lg xl:text-xl transition -translate-y-1/2 duration-300 cursor-pointer transform"
                                onClick={() => document.getElementById('category-scroll').scrollBy({
                                    left: -200,
                                    behavior: 'smooth'
                                })}
                            >
                                ◀
                            </button>
                            <button
                                className="top-1/2 right-0 z-10 absolute flex justify-center items-center bg-cyan-100 hover:bg-cyan-500 shadow-lg rounded-full w-7 md:w-8 lg:w-9 xl:w-10 h-7 md:h-8 lg:h-9 xl:h-10 hover:text-white text-base lg:text-lg xl:text-xl transition -translate-y-1/2 duration-300 cursor-pointer transform"
                                onClick={() => document.getElementById('category-scroll').scrollBy({
                                    left: 200,
                                    behavior: 'smooth'
                                })}
                            >
                                ▶
                            </button>

                            {/* Scrollable Row */}
                            <div className="relative overflow-hidden">
                                <div
                                    id="category-scroll"
                                    className="flex space-x-6 px-3 overflow-x-auto scroll-smooth snap-mandatory snap-x scrollbar-hide"
                                    style={{
                                        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                                    }}
                                >
                                    {categories.map((category, index) => (
                                        <div
                                            key={index}
                                            className={`${category.color} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 flex-shrink-0 w-[calc((100%-6rem)/6)] snap-start flex flex-col items-center`}
                                        >
                                            <div
                                                className={`w-16 h-16 ${category.color.split(' ')[0]} rounded-full flex items-center justify-center text-white text-2xl shadow-lg mb-4`}>
                                                {category.icon}
                                            </div>
                                            <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Featured Products */}
                        <div className="px-6 py-8">
                            <h2 className="mb-6 font-bold text-gray-900 text-2xl">Featured Products</h2>

                            {productsLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                                </div>
                            ) : productsError ? (
                                <div className="text-center py-12 text-red-500">
                                    Error loading products: {productsError}
                                </div>
                            ) : (
                                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                    {featuredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* More content to test scrolling */}
                        <div className="px-6 py-8">
                            <h2 className="mb-6 font-bold text-gray-900 text-2xl">More Products</h2>
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item}
                                         className="group bg-white shadow-sm hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300">
                                        <div className="relative bg-gray-100 aspect-square overflow-hidden">
                                            <div
                                                className="absolute inset-0 flex justify-center items-center bg-gradient-to-br from-purple-100 to-pink-100">
                                                <span className="text-4xl">👜</span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="mb-2 font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                                Accessory Item
                                            </h3>
                                            <div className="flex items-center space-x-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="fill-current w-3 h-3 text-yellow-400"/>
                                                ))}
                                                <span className="ml-1 text-gray-500 text-xs">(4.2)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-900 text-lg">35 TK</span>
                                                <button
                                                    className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg text-white text-sm transition-colors">
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <Footer/>
        </div>
    );
};

export default Home;