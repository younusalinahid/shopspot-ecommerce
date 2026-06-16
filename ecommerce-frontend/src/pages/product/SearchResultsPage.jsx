import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/productApi';
import { Search, Package, Loader2, FolderOpen, Tag } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';

export default function SearchResultsPage() {
    const [searchParams]         = useSearchParams();
    const navigate               = useNavigate();
    const query                  = searchParams.get('q') || '';

    const [results,   setResults]   = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [filter,    setFilter]    = useState('ALL');

    useEffect(() => {
        if (!query || query.length < 2) return;
        fetchResults();
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await productService.searchProducts(query);
            setResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const getType = (item) => {
        if (item.type) return item.type;
        if (item.price !== undefined) return 'PRODUCT';
        if (item.subCategoryId !== undefined) return 'SUBCATEGORY';
        return 'CATEGORY';
    };

    const products    = results.filter(i => getType(i) === 'PRODUCT');
    const categories  = results.filter(i => getType(i) === 'CATEGORY');
    const subCategories = results.filter(i =>
        getType(i) === 'SUBCATEGORY' || getType(i) === 'SUB_CATEGORY');

    const handleItemClick = (item) => {
        const type = getType(item);
        if (type === 'PRODUCT')     navigate(`/product/${item.id}`);
        else if (type === 'SUBCATEGORY' || type === 'SUB_CATEGORY')
            navigate(`/subcategory/${item.subCategoryId || item.id}`);
        else                        navigate(`/category/${item.categoryId || item.id}`);
    };

    const FILTERS = [
        { key: 'ALL',         label: 'All',          count: results.length },
        { key: 'PRODUCT',     label: 'Products',     count: products.length },
        { key: 'CATEGORY',    label: 'Categories',   count: categories.length },
        { key: 'SUBCATEGORY', label: 'Subcategories',count: subCategories.length },
    ];

    const filtered = filter === 'ALL' ? results
        : results.filter(i => {
            const t = getType(i);
            return filter === 'SUBCATEGORY'
                ? t === 'SUBCATEGORY' || t === 'SUB_CATEGORY'
                : t === filter;
        });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                        <Search className="w-4 h-4" />
                        <span>Search results for</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        "{query}"
                    </h1>
                    {!loading && (
                        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                            {results.length} result{results.length !== 1 && 's'} found
                        </p>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap mb-6">
                    {FILTERS.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${filter === f.key
                                    ? 'bg-cyan-500 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                            {f.label}
                            {f.count > 0 && (
                                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                                    ${filter === f.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                    {f.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                    </div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            No results found
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Try different keywords or browse our categories
                        </p>
                    </div>
                )}

                {/* Products grid */}
                {!loading && (filter === 'ALL' || filter === 'PRODUCT') && products.length > 0 && (
                    <section className="mb-10">
                        {filter === 'ALL' && (
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-cyan-500" />
                                Products ({products.length})
                            </h2>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    showDiscount={true}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories */}
                {!loading && (filter === 'ALL' || filter === 'CATEGORY') && categories.length > 0 && (
                    <section className="mb-10">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-green-500" />
                            Categories ({categories.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => handleItemClick(cat)}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                                        rounded-xl p-4 text-left hover:border-cyan-400 hover:shadow-md
                                        transition-all group">
                                    <span className="text-2xl mb-2 block">{cat.icon || '📁'}</span>
                                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-cyan-600">
                                        {cat.name}
                                    </p>
                                    <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        Category
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* SubCategories */}
                {!loading && (filter === 'ALL' || filter === 'SUBCATEGORY') && subCategories.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-purple-500" />
                            Subcategories ({subCategories.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {subCategories.map(sub => (
                                <button key={sub.id} onClick={() => handleItemClick(sub)}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                                        rounded-xl p-4 text-left hover:border-purple-400 hover:shadow-md
                                        transition-all group">
                                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600">
                                        {sub.name}
                                    </p>
                                    <span className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        Subcategory
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}