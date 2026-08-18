import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate, useLocation} from 'react-router-dom';
import {productService} from '../../api/productApi';
import {Search, Package, Loader2, Sparkles, ArrowUpDown} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import {toast} from 'react-toastify';

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const query = searchParams.get('q') || '';
    const mode = searchParams.get('mode');

    const imageFile = location.state?.imageFile;

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('DEFAULT');
    const [detectedKeywords, setDetectedKeywords] = useState('');

    useEffect(() => {
        if (mode === 'image' && imageFile) {
            fetchImageSearchResults(imageFile);
            return;
        }

        if (query && query.length >= 2) {
            fetchResults();
        }
    }, [query, mode, imageFile]);

    const fetchImageSearchResults = async (file) => {
        setLoading(true);
        try {
            const data = await productService.searchByImage(file);
            setResults(data.products || []);
            setDetectedKeywords(data.keywords || '');
        } catch (err) {
            toast.error("Failed to analyze image");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await productService.searchProducts(query);
            setResults(data || []);
            setDetectedKeywords('');
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const getSortedProducts = () => {
        const rawProducts = results.filter(i => (i.type === 'PRODUCT' || i.price !== undefined));
        if (sortBy === 'LOW_TO_HIGH') return [...rawProducts].sort((a, b) => (a.price || 0) - (b.price || 0));
        if (sortBy === 'HIGH_TO_LOW') return [...rawProducts].sort((a, b) => (b.price || 0) - (a.price || 0));
        return rawProducts;
    };

    const products = getSortedProducts();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="w-full mx-auto px-4 lg:px-8 max-w-[1600px]">

                <div
                    className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                            {mode === 'image' ? (
                                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse"/>
                            ) : (
                                <Search className="w-4 h-4"/>
                            )}
                            <span>{mode === 'image' ? 'AI Visual Search Result' : 'Search results for'}</span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'image' ? (
                                <span className="text-cyan-600 dark:text-cyan-400">
                                    {loading ? 'AI is analyzing your image...' : `🤖 AI Detected: "${detectedKeywords}"`}
                                </span>
                            ) : (
                                `"${query}"`
                            )}
                        </h1>

                        {!loading && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                {products.length} exact match{products.length !== 1 && 'es'} found
                            </p>
                        )}
                    </div>

                    {!loading && products.length > 0 && (
                        <div className="flex items-center gap-2 self-start md:self-auto">
                            <ArrowUpDown className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="DEFAULT">Sort by: Relevance</option>
                                <option value="LOW_TO_HIGH">Price: Low to High</option>
                                <option value="HIGH_TO_LOW">Price: High to Low</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div
                        className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                        <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mb-4"/>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Scanning catalog for visually
                            similar items...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            No matching products found
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {mode === 'image' ? "Could not find exact matching products in our inventory. Try uploading a clearer image." : "Try different keywords"}
                        </p>
                    </div>
                )}

                {/* Products Grid - Maximum 6 items */}
                {!loading && products.length > 0 && (
                    <section className="mb-10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {products.slice(0, 6).map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    showDiscount={true}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}