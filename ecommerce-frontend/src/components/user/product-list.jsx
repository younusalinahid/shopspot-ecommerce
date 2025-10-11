import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import CategorySidebar from '../user/CategorySidebar';
import ProductCard from '../user/product-card';
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
        fetchProducts();
    }, [subCategoryId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching products for subcategory:', subCategoryId);

            const productsData = await productService.getProductsBySubCategory(subCategoryId);
            console.log('Products:', productsData);
            setProducts(productsData);

        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="min-h-screen flex">
                {/* Fixed Sidebar */}
                <div className="w-80 flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white shadow-lg">
                    <CategorySidebar categories={categories}/>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-grow bg-gray-50 overflow-y-auto px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {subCategory?.name || 'Products'}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                {products.length} {products.length === 1 ? 'product' : 'products'} found
                            </p>
                        </div>

                        {/* Products Grid */}
                        {products.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-gray-500 text-xl">No products found in this category</p>
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

            {/* Footer */}
            <Footer/>
        </div>
    );
};

export default ProductList;