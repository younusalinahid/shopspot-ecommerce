import {useEffect, useState} from 'react';
import {Star, ArrowRight} from 'lucide-react';
import CategorySidebar from './CategorySidebar';
import {fetchCategory} from "../../api/category-api-service";
import Footer from "../../components/Footer";

const Home = () => {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchCategory()
            .then(data => {
                const mappedCategories = data.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon,
                    color: "bg-blue-100 text-blue-600",
                    subCategories: cat.subCategories.map(sub => ({
                        id: sub.id,
                        name: sub.name,
                        color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }))
                }));
                setCategories(mappedCategories);
            })
            .catch(err => console.error(err));
    }, []);

    // useEffect(() => {
    //     fetchCategory()
    //         .then(data => setCategories(data))
    //         .catch(err => console.error(err));
    // }, []);

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
                        {/* Hero Banner */}
                        <div
                            className="bg-gradient-to-r from-cyan-100 to-cyan-200 mx-4 my-6 rounded-2xl overflow-hidden">
                            <div className="flex justify-between items-center p-8">
                                <div className="flex-1 space-y-4">
                                    <h2 className="font-bold text-cyan-800 text-3xl">Embrace Your Heritage</h2>
                                    <h3 className="font-bold text-gray-700 text-2xl">Wear Tradition with Style</h3>

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
                                    <div
                                        className="relative flex justify-center items-center bg-cyan-300 rounded-2xl w-64 h-48 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-cyan-400"></div>
                                        <div className="relative text-6xl">👘</div>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                    <div key={item}
                                         className="group bg-white shadow-sm hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300">
                                        <div className="relative bg-gray-100 aspect-square overflow-hidden">
                                            <div
                                                className="absolute inset-0 flex justify-center items-center bg-gradient-to-br from-blue-100 to-green-100">
                                                <span className="text-4xl">👔</span>
                                            </div>
                                            <div
                                                className="top-3 right-3 absolute bg-red-500 px-2 py-1 rounded-full text-white text-xs">
                                                20% OFF
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="mb-2 font-semibold text-gray-800 group-hover:text-cyan-600 transition-colors">
                                                Product 500mg
                                            </h3>
                                            <div className="flex items-center space-x-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="fill-current w-3 h-3 text-yellow-400"/>
                                                ))}
                                                <span className="ml-1 text-gray-500 text-xs">(4.5)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="space-x-2">
                                                    <span className="font-bold text-gray-900 text-lg">45 TK</span>
                                                    <span className="text-gray-500 text-sm line-through">60 TK</span>
                                                </div>
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
            <Footer />
        </div>
    );
};

export default Home;