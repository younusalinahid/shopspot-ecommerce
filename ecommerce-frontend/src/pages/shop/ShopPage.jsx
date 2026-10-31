import {useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import axios from 'axios';
import {Search, SlidersHorizontal, X, ChevronDown, ChevronRight, ChevronLeft} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import {productService} from '../../api/productApi';
import {useCategories} from '../../hooks/useCategory';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
    {value: 'newest', label: 'Newest first'},
    {value: 'price_asc', label: 'Price: low to high'},
    {value: 'price_desc', label: 'Price: high to low'},
    {value: 'discount', label: 'Biggest discount'},
    {value: 'name', label: 'Name: A to Z'},
];

const PRICE_RANGES = [
    {label: 'Under ৳1,000', min: '', max: '999'},
    {label: '৳1,000 – ৳3,000', min: '1000', max: '3000'},
    {label: '৳3,000 – ৳5,000', min: '3000', max: '5000'},
    {label: '৳5,000 – ৳10,000', min: '5000', max: '10000'},
    {label: 'Over ৳10,000', min: '10000', max: ''},
];

const taka = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;

export default function ShopPage() {
    const [params, setParams] = useSearchParams();
    const {categories} = useCategories();

    // Filters live in the URL so a link like /shop?category=3 opens pre-filtered
    const q = params.get('q') || '';
    const categoryId = params.get('category') || '';
    const subCategoryId = params.get('sub') || '';
    const minPrice = params.get('min') || '';
    const maxPrice = params.get('max') || '';
    const inStock = params.get('stock') === '1';
    const onSale = params.get('sale') === '1';
    const sort = params.get('sort') || 'newest';
    const page = Math.max(0, parseInt(params.get('page') || '0', 10) || 0);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState(q);
    const [priceDraft, setPriceDraft] = useState({min: minPrice, max: maxPrice});
    const [expanded, setExpanded] = useState({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const topRef = useRef(null);

    const update = (changes, keepPage = false) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined || value === false) next.delete(key);
            else next.set(key, value === true ? '1' : String(value));
        });
        if (!keepPage) next.delete('page');
        setParams(next);
    };

    // Keep inputs in sync when the URL changes (back button, header links)
    useEffect(() => setSearchText(q), [q]);
    useEffect(() => setPriceDraft({min: minPrice, max: maxPrice}), [minPrice, maxPrice]);
    useEffect(() => {
        if (categoryId) setExpanded(prev => ({...prev, [categoryId]: true}));
    }, [categoryId]);

    // Search as you type (debounced)
    useEffect(() => {
        if (searchText === q) return undefined;
        const t = setTimeout(() => update({q: searchText.trim()}), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        productService.browseShop({
            q: q || undefined,
            categoryId: categoryId || undefined,
            subCategoryId: subCategoryId || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            inStock: inStock || undefined,
            onSale: onSale || undefined,
            sort,
            page,
            size: PAGE_SIZE,
        }, controller.signal)
            .then(setData)
            .catch(err => {
                if (!axios.isCancel(err)) setError('Could not load products. Please try again.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [q, categoryId, subCategoryId, minPrice, maxPrice, inStock, onSale, sort, page]);

    const selectedCategory = categories.find(c => String(c.id) === categoryId);
    const selectedSub = selectedCategory?.subCategories.find(s => String(s.id) === subCategoryId);
    const counts = useMemo(() => data?.categoryCounts || {}, [data]);
    const allCount = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

    const activeChips = [
        q && {key: 'q', label: `"${q}"`, clear: {q: ''}},
        selectedCategory && {key: 'cat', label: selectedCategory.name, clear: {category: '', sub: ''}},
        selectedSub && {key: 'sub', label: selectedSub.name, clear: {sub: ''}},
        (minPrice || maxPrice) && {
            key: 'price',
            label: minPrice && maxPrice ? `${taka(minPrice)} – ${taka(maxPrice)}`
                : minPrice ? `From ${taka(minPrice)}` : `Up to ${taka(maxPrice)}`,
            clear: {min: '', max: ''},
        },
        inStock && {key: 'stock', label: 'In stock', clear: {stock: ''}},
        onSale && {key: 'sale', label: 'On sale', clear: {sale: ''}},
    ].filter(Boolean);

    const totalPages = data?.totalPages || 0;
    const pageNumbers = useMemo(() => {
        const pages = [];
        for (let i = Math.max(0, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
        return pages;
    }, [page, totalPages]);

    const goToPage = (p) => {
        update({page: p > 0 ? p : ''}, true);
        topRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const applyPrice = (e) => {
        e?.preventDefault();
        let {min, max} = priceDraft;
        if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
        update({min, max});
    };

    const rowCls = (active) => `w-full flex justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors ${active
        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;
    const inputCls = 'w-full min-w-0 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';

    const sidebar = (
        <div className="space-y-6">
            <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
                <ul className="space-y-1 text-sm">
                    <li>
                        <button onClick={() => update({category: '', sub: ''})} className={rowCls(!categoryId)}>
                            <span>All products</span>
                            {data && <span className="text-gray-400 font-normal">{allCount}</span>}
                        </button>
                    </li>
                    {categories.map(cat => {
                        const active = String(cat.id) === categoryId;
                        const open = expanded[cat.id];
                        return (
                            <li key={cat.id}>
                                <div className="flex items-center">
                                    <button onClick={() => update({category: cat.id, sub: ''})}
                                            className={rowCls(active && !subCategoryId)}>
                                        <span className="truncate">{cat.name}</span>
                                        <span className="text-gray-400 font-normal">{counts[cat.id] || 0}</span>
                                    </button>
                                    {cat.subCategories.length > 0 && (
                                        <button onClick={() => setExpanded(prev => ({...prev, [cat.id]: !open}))}
                                                aria-label={open ? 'Hide sub-categories' : 'Show sub-categories'}
                                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            {open ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                        </button>
                                    )}
                                </div>
                                {open && (
                                    <ul className="ml-4 mt-1 border-l border-gray-200 dark:border-gray-700">
                                        {cat.subCategories.map(sub => (
                                            <li key={sub.id}>
                                                <button onClick={() => update({category: cat.id, sub: sub.id})}
                                                        className={`w-full text-left pl-3 pr-2 py-1.5 text-sm transition-colors ${String(sub.id) === subCategoryId
                                                            ? 'text-cyan-700 dark:text-cyan-300 font-semibold'
                                                            : 'text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>
                                                    {sub.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Price</h3>
                <ul className="space-y-1 text-sm mb-3">
                    {PRICE_RANGES.map(r => {
                        const active = minPrice === r.min && maxPrice === r.max;
                        return (
                            <li key={r.label}>
                                <button onClick={() => update(active ? {min: '', max: ''} : {min: r.min, max: r.max})}
                                        className={rowCls(active)}>
                                    {r.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <form onSubmit={applyPrice} className="flex items-center gap-2">
                    <input type="number" min="0" inputMode="numeric" placeholder={data ? `${data.priceMin}` : 'Min'}
                           value={priceDraft.min} aria-label="Minimum price" className={inputCls}
                           onChange={e => setPriceDraft(d => ({...d, min: e.target.value}))}/>
                    <span className="text-gray-400">–</span>
                    <input type="number" min="0" inputMode="numeric" placeholder={data ? `${data.priceMax}` : 'Max'}
                           value={priceDraft.max} aria-label="Maximum price" className={inputCls}
                           onChange={e => setPriceDraft(d => ({...d, max: e.target.value}))}/>
                    <button type="submit"
                            className="px-3 py-1.5 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white flex-shrink-0">
                        Go
                    </button>
                </form>
            </section>

            <section>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 py-1 cursor-pointer">
                    <input type="checkbox" checked={inStock} onChange={e => update({stock: e.target.checked})}
                           className="rounded text-cyan-600 focus:ring-cyan-500"/>
                    In stock only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 py-1 cursor-pointer">
                    <input type="checkbox" checked={onSale} onChange={e => update({sale: e.target.checked})}
                           className="rounded text-cyan-600 focus:ring-cyan-500"/>
                    On sale (discounted)
                </label>
            </section>
        </div>
    );

    return (
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-6 sm:py-8 scroll-mt-4" ref={topRef}>
            <div className="mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedSub ? selectedSub.name : selectedCategory ? selectedCategory.name : 'Shop'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedCategory ? `All products in ${selectedCategory.name}` : 'Browse our full collection'}
                </p>
            </div>

            <div className="flex gap-6 lg:gap-8">
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
                        {sidebar}
                    </div>
                </aside>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                            <input type="search" value={searchText} onChange={e => setSearchText(e.target.value)}
                                   placeholder="Search in shop..." aria-label="Search products" maxLength={100}
                                   className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"/>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                <SlidersHorizontal className="w-4 h-4"/> Filters
                                {activeChips.length > 0 && (
                                    <span className="bg-cyan-600 text-white text-xs rounded-full px-1.5">{activeChips.length}</span>
                                )}
                            </button>
                            <select value={sort} onChange={e => update({sort: e.target.value === 'newest' ? '' : e.target.value})}
                                    aria-label="Sort products"
                                    className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-5 text-sm min-h-[1.75rem]">
                        {data && (
                            <span className="text-gray-600 dark:text-gray-400 mr-1">
                                {data.totalElements} product{data.totalElements === 1 ? '' : 's'}
                            </span>
                        )}
                        {activeChips.map(chip => (
                            <button key={chip.key} onClick={() => update(chip.clear)}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100">
                                {chip.label} <X className="w-3.5 h-3.5"/>
                            </button>
                        ))}
                        {activeChips.length > 1 && (
                            <button onClick={() => setParams(new URLSearchParams())}
                                    className="text-gray-500 hover:text-red-500 underline">Clear all</button>
                        )}
                    </div>

                    {error ? (
                        <div className="text-center py-16 text-red-500">{error}</div>
                    ) : loading && !data ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
                        </div>
                    ) : data && data.content.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-600 dark:text-gray-300 font-medium">No products match these filters.</p>
                            <button onClick={() => setParams(new URLSearchParams())}
                                    className="mt-3 text-cyan-600 hover:underline">Clear filters</button>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                            {data?.content.map(product => <ProductCard key={product.id} product={product}/>)}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <nav className="flex justify-center items-center gap-1 sm:gap-2 mt-10" aria-label="Pagination">
                            <button onClick={() => goToPage(page - 1)} disabled={page === 0} aria-label="Previous page"
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40">
                                <ChevronLeft className="w-4 h-4"/>
                            </button>
                            {pageNumbers.map(p => (
                                <button key={p} onClick={() => goToPage(p)} aria-current={p === page ? 'page' : undefined}
                                        className={`min-w-[2.25rem] px-3 py-1.5 rounded-lg text-sm ${p === page
                                            ? 'bg-cyan-600 text-white'
                                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {p + 1}
                                </button>
                            ))}
                            <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages - 1} aria-label="Next page"
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40">
                                <ChevronRight className="w-4 h-4"/>
                            </button>
                        </nav>
                    )}
                </div>
            </div>

            {filtersOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)}/>
                    <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
                            <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"
                                    className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button onClick={() => setFiltersOpen(false)}
                                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium">
                                Show {data ? data.totalElements : ''} products
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
