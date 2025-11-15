import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import CategorySidebar from '../user/CategorySidebar';
import ProductCard from './productCard';
import {categoryApi} from "../../api/category-api-service";
import Footer from "../Footer";
import {productService} from "../../api/product-api";
import {useCategories} from "../../hooks/useCategory";

const ProductList = () => {
    const {subCategoryId} = useParams();
    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
    const [products, setProducts] = useState([]);
    const [subCategory, setSubCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (subCategoryId) {
            Promise.all([
                productService.getProductsBySubCategory(subCategoryId),
                categoryApi.getSubCategoryWithProducts(subCategoryId)
            ])
                .then(([productsData, subCategoryData]) => {
                    setProducts(productsData);
                    setSubCategory(subCategoryData);
                })
                .catch(() => setError('Failed to load data. Please try again.'))
                .finally(() => setLoading(false));
        }
    }, [subCategoryId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const productsData = await productService.getProductsBySubCategory(subCategoryId);
            setProducts(productsData);

        } catch (err) {
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="text-center">
                    <p className="text-red-500 dark:text-red-400 text-xl mb-4 transition-colors duration-300">{error}</p>
                    <button
                        onClick={() => {
                            setError(null);
                            setLoading(true);
                            if (subCategoryId) {
                                Promise.all([
                                    productService.getProductsBySubCategory(subCategoryId),
                                    categoryApi.getSubCategoryWithProducts(subCategoryId)
                                ])
                                    .then(([productsData, subCategoryData]) => {
                                        setProducts(productsData);
                                        setSubCategory(subCategoryData);
                                    })
                                    .catch(() => setError('Failed to load data. Please try again.'))
                                    .finally(() => setLoading(false));
                            }
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 px-6 py-2 rounded-lg text-white transition-colors duration-300"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="dark:bg-gray-900 transition-colors duration-300">
            <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Fixed Sidebar */}
                <div className="w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300">
                    <CategorySidebar categories={categories}/>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-grow bg-gray-50 dark:bg-gray-900 overflow-y-auto px-6 py-8 transition-colors duration-300">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                                {subCategory?.name || 'Products'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-300">
                                {products.length} {products.length === 1 ? 'product' : 'products'} found
                            </p>
                        </div>

                        {/* Products Grid */}
                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-gray-500 dark:text-gray-400 text-xl transition-colors duration-300">
                                    No products found in this category
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product}/>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default ProductList;