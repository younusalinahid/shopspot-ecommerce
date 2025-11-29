import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/user/productCard';
import { categoryApi } from '../api/category-api-service';

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryName = location.state?.categoryName || 'Category';

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                const categoryProducts = await categoryApi.getProductsByCategory(categoryId);
                setProducts(categoryProducts);
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching category products:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryProducts();
        }
    }, [categoryId]);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors duration-300 mr-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {categoryName} Products
                    </h1>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 dark:text-red-400">
                        {error}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No products found in this category
                    </div>
                ) : (
                    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;