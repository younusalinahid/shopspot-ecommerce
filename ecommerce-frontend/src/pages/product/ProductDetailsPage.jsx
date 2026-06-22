import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Star, ShoppingCart, Heart, Share2, Truck, RefreshCw, ArrowLeft, Plus, Minus, ZoomIn, GitCompare, Eye} from 'lucide-react';
import {productService} from '../../api/productApi';
import {useCart} from '../../context/CartContext';
import {isAuthenticated, getCurrentUser} from '../../api/authApi';
import {toast} from 'react-toastify';
import {wishlistApi} from '../../api/wishlistApi';
import ReviewSection from "../../components/product/ReviewSection";
import {getReviewSummary} from '../../api/reviewApi';

const ProductDetailsPage = () => {
    const {productId} = useParams();
    const navigate = useNavigate();
    const {addToCart, loading} = useCart();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [error, setError] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({x: 0, y: 0});
    const [addingToCart, setAddingToCart] = useState(false);
    const [reviewSummary, setReviewSummary] = useState({averageRating: 0, totalReviews: 0});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isRelatedLoading, setIsRelatedLoading] = useState(false);
    const [authState, setAuthState] = useState({isAuthenticated: false, user: null});
    const [compareList, setCompareList] = useState(() => {
        const saved = localStorage.getItem('productCompareList');
        return saved ? JSON.parse(saved) : [];
    });

    const checkAuthStatus = () => {
        setAuthState({isAuthenticated: isAuthenticated(), user: getCurrentUser()});
    };

    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('userLoggedIn', checkAuthStatus);
        window.addEventListener('userLoggedOut', checkAuthStatus);
        return () => {
            window.removeEventListener('userLoggedIn', checkAuthStatus);
            window.removeEventListener('userLoggedOut', checkAuthStatus);
        };
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('productCompareList');
            setCompareList(saved ? JSON.parse(saved) : []);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const addToCompare = (item) => {
        if (!item) return;
        const pId = item.id || item._id;
        const current = JSON.parse(localStorage.getItem('productCompareList') || '[]');
        if (current.some(i => (i.id || i._id) === pId)) { toast.info("Already in comparison list!"); return; }
        if (current.length >= 3) { toast.warning("Max 3 products can be compared."); return; }
        const updated = [...current, {
            ...item,
            displayCategoryName: item.subCategory?.name || item.category?.name || item.categoryName || "N/A"
        }];
        localStorage.setItem('productCompareList', JSON.stringify(updated));
        setCompareList(updated);
        window.dispatchEvent(new Event("storage"));
        toast.success("Added to comparison list!");
    };

    useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    }, [productId]);


    useEffect(() => {
        if (authState.isAuthenticated && productId && product) {
            wishlistApi.getStatus(productId)
                .then(data => setIsWishlisted(data.wishlisted))
                .catch(() => {});
        }
    }, [authState.isAuthenticated, productId, product]);

    useEffect(() => {
        if (!productId) return;
        const fetchAll = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const productData = await productService.getProductById(productId);
                if (productData) {
                    productData.stock = parseInt(productData.stock ?? 10);
                    productData.price = parseFloat(productData.price) || 0;
                    if (productData.originalPrice) productData.originalPrice = parseFloat(productData.originalPrice) || 0;
                }
                setProduct(productData);

                try {
                    const res = await getReviewSummary(productId);
                    const s = res.data || res;
                    setReviewSummary({averageRating: s.averageRating || 0, totalReviews: s.totalReviews || 0});
                } catch { setReviewSummary({averageRating: 0, totalReviews: 0}); }

                const subCategoryId = productData?.subCategory?.id || productData?.subCategoryId;
                if (subCategoryId) {
                    setIsRelatedLoading(true);
                    try {
                        const related = await productService.getProductsBySubCategory(subCategoryId);
                        const items = Array.isArray(related) ? related : related.data || [];
                        setRelatedProducts(items.filter(i => (i.id || i._id) !== (productData.id || productData._id)).slice(0, 12));
                    } catch { setRelatedProducts([]); }
                    finally { setIsRelatedLoading(false); }
                }
            } catch {
                setError('Product not found');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [productId]);

    useEffect(() => { if (product) setQuantity(1); }, [product]);

    const handleAddToCart = async () => {
        if (addingToCart || !product) return;
        if (!authState.isAuthenticated) { toast.info('Please login to add items to cart'); navigate('/login', {state: {from: `/product/${productId}`}}); return; }
        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result) toast.success('Product added to cart successfully!');
            window.dispatchEvent(new CustomEvent("cartItemAdded", {detail: {productName: product.name}}));
        } catch { toast.error('Failed to add product to cart'); }
        finally { setAddingToCart(false); }
    };

    const handleBuyNow = async () => {
        if (addingToCart || !product) return;
        if (!authState.isAuthenticated) { toast.info('Please login to proceed'); navigate('/login', {state: {from: `/product/${productId}`}}); return; }
        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result) { toast.success('Redirecting to cart...'); setTimeout(() => navigate('/cart'), 1000); }
        } catch { toast.error('Failed to add product to cart'); }
        finally { setAddingToCart(false); }
    };

    const handleWishlist = async () => {
        if (!authState.isAuthenticated) { toast.info('Please login to add to wishlist'); navigate('/login'); return; }
        try {
            const res = await wishlistApi.toggleWishlist(product.id);
            setIsWishlisted(res.wishlisted);
            toast.success(res.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        } catch { toast.error('Failed to update wishlist'); }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try { await navigator.share({title: product?.name, text: product?.description, url: window.location.href}); }
            catch {}
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Product link copied!');
        }
    };

    const handleImageMouseMove = (e) => {
        if (!isZoomed) return;
        const {left, top, width, height} = e.currentTarget.getBoundingClientRect();
        setZoomPosition({x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100});
    };

    const increaseQuantity = () => {
        const maxStock = parseInt(product?.stock) || 0;
        if (maxStock === 0 || quantity < maxStock) setQuantity(q => parseInt(q) + 1);
        else toast.warning(`Only ${maxStock} items available`);
    };

    const decreaseQuantity = () => { if (quantity > 1) setQuantity(q => parseInt(q) - 1); };

    const getImageSource = (imageData) => {
        if (!imageData) return null;
        return imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
    };

    const getStockStatus = () => {
        const stockCount = parseInt(product?.stock);
        if (isNaN(stockCount) || stockCount === 0) return {hasStock: true, stockCount: 999, isUnlimited: true};
        return {hasStock: stockCount > 0, stockCount, isUnlimited: false};
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"/>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Product Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The product does not exist.'}</p>
                <button onClick={() => navigate('/')} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg">Go Back Home</button>
            </div>
        </div>
    );

    const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
    const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const productImages = product.imageData ? [getImageSource(product.imageData)] : [];
    const mainImage = productImages[selectedImage];
    const {hasStock, stockCount, isUnlimited} = getStockStatus();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <div className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                        <span>Back</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT CONTAINER (Main Info & Reviews) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Image Box */}
                            <div className="space-y-6">
                                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden group">
                                    <div
                                        className={`relative overflow-hidden rounded-lg ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                                        onMouseEnter={() => setIsZoomed(true)}
                                        onMouseLeave={() => setIsZoomed(false)}
                                        onMouseMove={handleImageMouseMove}
                                    >
                                        {mainImage ? (
                                            <>
                                                <img src={mainImage} alt={product.name}
                                                     className={`w-full h-96 object-contain transition-all duration-700 ${isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'}`}
                                                     style={{transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'}}
                                                />
                                                <div className={`absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full transition-all ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <ZoomIn className="w-5 h-5"/>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <span className="text-6xl text-gray-400 mb-4">📦</span>
                                                <p className="text-gray-500 dark:text-gray-400">No Image Available</p>
                                            </div>
                                        )}
                                    </div>
                                    {hasDiscount && (
                                        <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                            {discountPercentage}% OFF
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    {product.subCategory && (
                                        <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-medium">
                                            {product.subCategory.name || 'Uncategorized'}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">{product.name}</h1>

                                {/* Rating */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-full">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.round(reviewSummary.averageRating) ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}/>
                                        ))}
                                        <span className="ml-1.5 text-sm text-gray-700 dark:text-amber-300 font-semibold">
                                            {reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : 'No ratings'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})</span>
                                </div>

                                {/* Price */}
                                <div className="space-y-1">
                                    <div className="flex items-baseline space-x-3">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">৳ {product.price?.toFixed(2)}</span>
                                        {hasDiscount && (
                                            <>
                                                <span className="text-base text-gray-400 line-through">৳ {product.originalPrice?.toFixed(2)}</span>
                                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-bounce">{discountPercentage}% OFF</span>
                                            </>
                                        )}
                                    </div>
                                    {hasDiscount && (
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">🎉 You save ৳ {(product.originalPrice - product.price).toFixed(2)}</p>
                                    )}
                                </div>

                                {/* Stock */}
                                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${hasStock ? 'bg-green-500' : 'bg-red-500'}`}/>
                                    <span className={`text-sm font-semibold ${hasStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isUnlimited ? 'In Stock (Unlimited)' : hasStock ? `${stockCount} items in stock` : 'Out of stock'}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="bg-blue-50/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all duration-300 cursor-pointer">{product.description || 'No description available.'}</p>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center space-x-4 bg-blue-50/30 dark:bg-gray-800/20 p-3 rounded-xl border border-gray-100 dark:border-gray-700/40">
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                                    <div className="flex items-center space-x-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                                        <button onClick={decreaseQuantity} disabled={quantity <= 1} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                                            <Minus className="w-3 h-3"/>
                                        </button>
                                        <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white">{quantity}</span>
                                        <button onClick={increaseQuantity} disabled={!isUnlimited && quantity >= stockCount} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                                            <Plus className="w-3 h-3"/>
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-3 pt-1">
                                    <button onClick={handleAddToCart} disabled={!hasStock || addingToCart || loading || !authState.isAuthenticated}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 disabled:bg-gray-400">
                                        <ShoppingCart className="w-4 h-4"/>
                                        <span>{!authState.isAuthenticated ? 'Login to Add' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                                    </button>
                                    <button onClick={handleBuyNow} disabled={!hasStock || addingToCart || loading || !authState.isAuthenticated}
                                            className="flex-1 bg-gray-900 hover:bg-black text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center disabled:bg-gray-400">
                                        <span>{!authState.isAuthenticated ? 'Login to Buy' : addingToCart ? 'Adding...' : 'Buy Now'}</span>
                                    </button>
                                </div>

                                {/* Secondary Actions */}
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <button onClick={handleWishlist} disabled={!authState.isAuthenticated}
                                            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm border transition-all ${isWishlisted ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100/50'}`}>
                                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`}/>
                                        <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                                    </button>
                                    <button onClick={handleShare} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm border border-blue-100/50">
                                        <Share2 className="w-3.5 h-3.5"/>
                                        <span>Share</span>
                                    </button>
                                    <button onClick={() => addToCompare(product)} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm border border-blue-100/50">
                                        <GitCompare className="w-3.5 h-3.5"/>
                                        <span>Compare</span>
                                    </button>
                                </div>

                                {/* Delivery & Return Policy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-100 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl">
                                        <Truck className="w-8 h-8 text-cyan-600"/>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Free Delivery</h4>
                                            <p className="text-[11px] text-gray-600 dark:text-gray-400">Within 2-3 days</p>
                                        </div>
                                    </div>
                                    {/* 7 Days Return Policy Section */}
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-amber-100 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl">
                                        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin-slow"/>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">7 Days Return</h4>
                                            <p className="text-[11px] text-gray-600 dark:text-gray-400">Easy return & refund policy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                            <ReviewSection
                                productId={productId}
                                currentUserEmail={authState.user?.email}
                                currentUserName={authState.user?.fullName}
                                onSummaryUpdate={setReviewSummary}
                            />
                        </div>
                    </div>

                    {/* RIGHT CONTAINER: MAX 12 Related Products Sidebar Grid */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 sticky top-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center justify-between">
                                <span>Related Products</span>
                                <span className="text-[11px] font-medium text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-full">Recommended</span>
                            </h2>

                            {isRelatedLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"/>
                                </div>
                            ) : relatedProducts.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-900/40 rounded-xl">No related products found.</p>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                    {relatedProducts.map((item) => {
                                        const itemId = item.id || item._id;
                                        const itemHasDiscount = !!(item.originalPrice && item.originalPrice > item.price);
                                        const itemDiscount = itemHasDiscount ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
                                        return (
                                            <div key={itemId} className="group bg-gray-50/40 dark:bg-gray-900/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700/30 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">

                                                {/* Image */}
                                                <div className="relative rounded-lg bg-gray-50 dark:bg-gray-900 p-2 overflow-hidden mb-3 flex items-center justify-center h-28 w-full">
                                                    {item.imageData ? (
                                                        <img src={getImageSource(item.imageData)} alt={item.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"/>
                                                    ) : <span className="text-2xl">📦</span>}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                                        <button onClick={() => navigate(`/product/${itemId}`)} className="bg-white text-gray-900 p-1.5 rounded-full shadow hover:bg-cyan-500 hover:text-white transition-colors" title="View Details">
                                                            <Eye className="w-3.5 h-3.5"/>
                                                        </button>
                                                        <button onClick={() => addToCompare(item)} className="bg-white text-gray-900 p-1.5 rounded-full shadow hover:bg-cyan-500 hover:text-white transition-colors" title="Compare">
                                                            <GitCompare className="w-3.5 h-3.5"/>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 flex flex-col justify-between space-y-2">
                                                    <h3 onClick={() => navigate(`/product/${itemId}`)} className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-cyan-500 line-clamp-2 cursor-pointer transition-colors leading-tight">
                                                        {item.name}
                                                    </h3>

                                                    <div className="flex items-end justify-between pt-1">
                                                        <div className="min-w-0">
                                                            <span className="text-xs font-extrabold text-gray-900 dark:text-white block">৳ {item.price?.toFixed(2)}</span>
                                                            {itemHasDiscount && (
                                                                <span className="text-[10px] text-gray-400 line-through block">৳ {item.originalPrice?.toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                        <button onClick={async () => {
                                                            if (!authState.isAuthenticated) { toast.info('Please login'); navigate('/login'); return; }
                                                            try { await addToCart(itemId, 1); toast.success('Added to cart!'); }
                                                            catch { toast.error('Failed to add'); }
                                                        }} className="bg-cyan-100 dark:bg-cyan-950/80 hover:bg-cyan-500 text-cyan-700 dark:text-cyan-400 hover:text-white p-2 rounded-lg transition-all flex-shrink-0">
                                                            <ShoppingCart className="w-3.5 h-3.5"/>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Discount Tag */}
                                                {itemHasDiscount && (
                                                    <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
                                                        {itemDiscount}% OFF
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;