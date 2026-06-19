import React, { useState, useEffect } from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, Plus, Minus, ZoomIn} from 'lucide-react';
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

    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null
    });

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [productId]);

    const checkAuthStatus = () => {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        setAuthState({
            isAuthenticated: authenticated,
            user: user
        });
    };

    const fetchReviewSummary = async () => {
        if (!productId) return;
        try {
            const response = await getReviewSummary(productId);
            const summary = response.data || response;
            setReviewSummary({
                averageRating: summary.averageRating || 0,
                totalReviews: summary.totalReviews || 0
            });
        } catch (error) {
            setReviewSummary({averageRating: 0, totalReviews: 0});
        }
    };

    useEffect(() => {
        checkAuthStatus();
        const handleAuthChange = () => {
            checkAuthStatus();
        };
        window.addEventListener('userLoggedIn', handleAuthChange);
        window.addEventListener('userLoggedOut', handleAuthChange);

        return () => {
            window.removeEventListener('userLoggedIn', handleAuthChange);
            window.removeEventListener('userLoggedOut', handleAuthChange);
        };
    }, []);

    useEffect(() => {
        if (authState.isAuthenticated && productId && product) {
            wishlistApi.getStatus(productId)
                .then(data => setIsWishlisted(data.wishlisted))
                .catch(() => {
                });
        }
    }, [authState.isAuthenticated, productId, product]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const productData = await productService.getProductById(productId);

                if (productData) {
                    productData.stock = productData.stock !== undefined ? parseInt(productData.stock) : 10;
                    productData.price = parseFloat(productData.price) || 0;
                    if (productData.originalPrice) {
                        productData.originalPrice = parseFloat(productData.originalPrice) || 0;
                    }
                }

                setProduct(productData);
                await fetchReviewSummary();
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Product not found');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    useEffect(() => {
        if (product) {
            setQuantity(1);
        }
    }, [product]);

    const handleReviewSummaryUpdate = (newSummary) => {
        setReviewSummary(newSummary);
    };

    const handleAddToCart = async () => {
        if (addingToCart || !product) return;

        if (!authState.isAuthenticated) {
            toast.info('Please login to add items to cart');
            navigate('/login', {state: {from: `/product/${productId}`}});
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result) {
                toast.success('Product added to cart successfully!');
                triggerChatBotRecommendation();
            }
            const event = new CustomEvent("cartItemAdded", {
                detail: { productName: product.name }
            });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const triggerChatBotRecommendation = () => {
        try {
            console.log("Triggering AI for product:", product.name);

            const cartTriggerEvent = new CustomEvent("triggerAddToCartChat", {
                detail: { productName: product.name }
            });
            window.dispatchEvent(cartTriggerEvent);

        } catch (err) {
            console.error('Failed to trigger AI bot:', err);
        }
    };

    const handleBuyNow = async () => {
        if (addingToCart || !product) return;

        if (!authState.isAuthenticated) {
            toast.info('Please login to proceed with purchase');
            navigate('/login', {state: {from: `/product/${productId}`}});
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result) {
                toast.success('Product added to cart! Redirecting...');
                setTimeout(() => {
                    navigate('/cart');
                }, 1000);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleWishlist = async () => {
        if (!authState.isAuthenticated) {
            toast.info('Please login to add to wishlist');
            navigate('/login');
            return;
        }

        try {
            const res = await wishlistApi.toggleWishlist(product.id);
            setIsWishlisted(res.wishlisted);
            toast.success(res.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    text: product?.description,
                    url: window.location.href,
                });
                toast.success('Product shared successfully!');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Product link copied to clipboard!');
        }
    };

    const handleImageMouseMove = (e) => {
        if (!isZoomed) return;
        const {left, top, width, height} = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({x, y});
    };

    const increaseQuantity = () => {
        if (!product) return;
        const maxStock = parseInt(product.stock) || 0;
        const currentQty = parseInt(quantity) || 1;

        if (maxStock === 0) {
            setQuantity(prev => parseInt(prev) + 1);
        } else if (currentQty < maxStock) {
            setQuantity(prev => parseInt(prev) + 1);
        } else {
            toast.warning(`Only ${maxStock} items available in stock`);
        }
    };

    const decreaseQuantity = () => {
        const currentQty = parseInt(quantity) || 1;
        if (currentQty > 1) {
            setQuantity(prev => parseInt(prev) - 1);
        }
    };

    const getImageSource = (imageData) => {
        if (!imageData) return null;
        if (imageData.startsWith('data:')) return imageData;
        return `data:image/jpeg;base64,${imageData}`;
    };

    const getStockStatus = () => {
        if (!product) return {hasStock: false, stockCount: 0, isUnlimited: false};
        const stockCount = parseInt(product.stock);
        if (isNaN(stockCount) || stockCount === 0) {
            return {hasStock: true, stockCount: 999, isUnlimited: true};
        }
        return {hasStock: stockCount > 0, stockCount: stockCount, isUnlimited: false};
    };

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Product Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The product you are looking for does not exist.'}</p>
                    <button onClick={() => navigate('/')}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-all">
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price);
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const productImages = product.imageData ? [getImageSource(product.imageData)] : [];
    const mainImage = productImages[selectedImage];
    const {hasStock, stockCount, isUnlimited} = getStockStatus();
    const maxStock = stockCount;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"/>
                        <span>Back</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Product Images */}
                    <div className="space-y-6">
                        <div
                            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm overflow-hidden group">
                            <div
                                className={`relative overflow-hidden rounded-lg ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                                onMouseMove={handleImageMouseMove}
                            >
                                {mainImage ? (
                                    <>
                                        <img
                                            src={mainImage}
                                            alt={product.name}
                                            className={`w-full h-96 object-contain transition-all duration-700 ${isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'}`}
                                            style={{transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'}}
                                        />
                                        <div
                                            className={`absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full transition-all duration-300 ${isZoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                                            <ZoomIn className="w-5 h-5"/>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="w-full h-96 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <span className="text-6xl text-gray-400 mb-4">📦</span>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">No Image Available</p>
                                    </div>
                                )}
                            </div>
                            {hasDiscount ? (
                                <div
                                    className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                    {discountPercentage}% OFF
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            {product.subCategory && (
                                <span
                                    className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-medium">
                                    {product.subCategory.name || 'Uncategorized'}
                                </span>
                            )}
                            {product.brand && (
                                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                                    {product.brand}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                            {product.name}
                        </h1>

                        {/* Ratings */}
                        <div className="flex items-center space-x-4">
                            <div
                                className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.round(reviewSummary.averageRating) ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                ))}
                                <span className="ml-2 text-gray-700 dark:text-amber-300 font-semibold">
                                    {reviewSummary.averageRating > 0 ? reviewSummary.averageRating.toFixed(1) : 'No ratings'}
                                </span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">
                                ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>

                        {/* Price Block */}
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ৳ {product.price?.toFixed(2)}
                                </span>
                                {hasDiscount ? (
                                    <>
                                        <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                                            ৳ {product.originalPrice?.toFixed(2)}
                                        </span>
                                        <span
                                            className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold animate-bounce">
                                            {discountPercentage}% OFF
                                        </span>
                                    </>
                                ) : null}
                            </div>
                            {hasDiscount ? (
                                <p className="text-green-600 dark:text-green-400 font-medium flex items-center space-x-1">
                                    <span>🎉</span>
                                    <span>You save ৳ {(product.originalPrice - product.price).toFixed(2)}</span>
                                </p>
                            ) : null}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                            <div
                                className={`w-3 h-3 rounded-full animate-pulse ${hasStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span
                                className={hasStock ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
                                {isUnlimited ? 'In Stock (Unlimited)' : hasStock ? `${stockCount} items in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <div
                            className="bg-blue-100 dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200/50 transition-colors duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                                Description
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                                {product.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Quantity Selector */}
                        <div
                            className="flex items-center space-x-4 bg-blue-100 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200/60">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                            <div
                                className="flex items-center space-x-3 border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                                <button
                                    onClick={decreaseQuantity}
                                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4"/>
                                </button>
                                <span className="px-4 font-semibold text-gray-900 dark:text-white">{quantity}</span>
                                <button
                                    onClick={increaseQuantity}
                                    className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    disabled={!isUnlimited && quantity >= maxStock}
                                >
                                    <Plus className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 pt-2">
                            <button
                                onClick={handleAddToCart}
                                disabled={!hasStock || addingToCart || loading || !authState.isAuthenticated}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 disabled:bg-gray-400"
                            >
                                <ShoppingCart className="w-5 h-5"/>
                                <span>{!authState.isAuthenticated ? 'Login to Add' : addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={!hasStock || addingToCart || loading || !authState.isAuthenticated}
                                className="flex-1 bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center disabled:bg-gray-400"
                            >
                                <span>{!authState.isAuthenticated ? 'Login to Buy' : addingToCart ? 'Adding...' : 'Buy Now'}</span>
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleWishlist}
                                disabled={!authState.isAuthenticated}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                    isWishlisted
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 text-red-600'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}/>
                                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                            >
                                <Share2 className="w-4 h-4"/>
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Badges Info */}
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-200 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl transition-colors duration-300">
                                <Truck className="w-10 h-10 text-cyan-600 dark:text-cyan-400"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                        Free Delivery
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                        Delivery within 2-3 days
                                    </p>
                                </div>
                            </div>
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-200 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl transition-colors duration-300">
                                <Shield className="w-10 h-10 text-green-600 dark:text-green-400"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                        1 Year Warranty
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                        Manufacturer warranty
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 💡 REVIEW SECTION */}
                <div className="mt-12">
                    <ReviewSection
                        productId={productId}
                        currentUserEmail={authState.user?.email}
                        currentUserName={authState.user?.fullName}
                        onSummaryUpdate={handleReviewSummaryUpdate}
                    />
                </div>

            </div>
        </div>
    );
};

export default ProductDetailsPage;