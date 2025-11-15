import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, Plus, Minus, ZoomIn} from 'lucide-react';
import {productService} from '../api/product-api';
import { useCart } from '../context/CartContext';
import { isAuthenticated, getCurrentUser} from '../api/auth-api';
import { toast } from 'react-toastify';

const ProductDetails = () => {
    const {productId} = useParams();
    const navigate = useNavigate();
    const { addToCart, loading } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [error, setError] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({x: 0, y: 0});
    const [addingToCart, setAddingToCart] = useState(false);

    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null
    });

    useEffect(() => {
        checkAuthStatus();

        // Listen for auth changes
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

    const checkAuthStatus = () => {
        const authenticated = isAuthenticated();
        const user = getCurrentUser();
        setAuthState({
            isAuthenticated: authenticated,
            user: user
        });
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const productData = await productService.getProductById(productId);
                setProduct(productData);
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

    const handleAddToCart = async () => {
        if (addingToCart || !product) return;

        if (!authState.isAuthenticated) {
            toast.info('Please login to add items to cart');
            navigate('/login', { state: { from: `/product/${productId}` } });
            return;
        }

        setAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity);
            if (result) {
                toast.success('Product added to cart successfully!');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (addingToCart || !product) return;

        // User authentication check
        if (!authState.isAuthenticated) {
            toast.info('Please login to proceed with purchase');
            navigate('/login', { state: { from: `/product/${productId}` } });
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

    const handleQuickAddToCart = async () => {
        if (!authState.isAuthenticated) {
            toast.info('Please login to add items to cart');
            navigate( { state: { from: `/product/${productId}` } });
            return;
        }

        await handleAddToCart();
    };

    const getImageSource = (imageData) => {
        if (!imageData) return null;
        if (imageData.startsWith('data:')) return imageData;
        return `data:image/jpeg;base64,${imageData}`;
    };

    const handleImageMouseMove = (e) => {
        if (!isZoomed) return;

        const {left, top, width, height} = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPosition({x, y});
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
                toast.success('Product shared successfully!');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast.info('Product link copied to clipboard!');
        }
    };

    const increaseQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 dark:border-cyan-400 transition-colors duration-300"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Product Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{error || 'The product you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const productImages = product.imageData ? [getImageSource(product.imageData)] : [];
    const mainImage = productImages[selectedImage];

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
                    {/* Product Images - Improved Section */}
                    <div className="space-y-6">
                        {/* Main Image Container */}
                        <div
                            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-cyan-500/20 transition-all duration-500 overflow-hidden group">
                            <div
                                className={`relative overflow-hidden rounded-lg transition-all duration-500 ${
                                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                                }`}
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                                onMouseMove={handleImageMouseMove}
                            >
                                {mainImage ? (
                                    <>
                                        <img
                                            src={mainImage}
                                            alt={product.name}
                                            className={`w-full h-96 object-contain transition-all duration-700 ${
                                                isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                                            }`}
                                            style={{
                                                transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center'
                                            }}
                                        />

                                        {/* Zoom Indicator */}
                                        <div
                                            className={`absolute top-4 right-4 bg-black/70 dark:bg-white/70 text-white dark:text-gray-900 p-2 rounded-full transition-all duration-300 ${
                                                isZoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                                            }`}>
                                            <ZoomIn className="w-5 h-5"/>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg transition-colors duration-300">
                                        <span className="text-6xl text-gray-400 dark:text-gray-500 mb-4">📦</span>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">No Image Available</p>
                                    </div>
                                )}
                            </div>

                            {/* Discount Badge */}
                            {hasDiscount && (
                                <div
                                    className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                    {discountPercentage}% OFF
                                </div>
                            )}

                            {/* Quick Add to Cart Button on Image */}
                            {authState.isAuthenticated && (
                                <button
                                    onClick={handleQuickAddToCart}
                                    disabled={product.stock === 0 || addingToCart}
                                    className="absolute bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-6 h-6"/>
                                </button>
                            )}
                        </div>

                        {/* Thumbnail Images with Enhanced Design */}
                        {productImages.length > 1 && (
                            <div className="flex space-x-4 overflow-x-auto pb-4">
                                {productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedImage(index);
                                            setIsZoomed(false);
                                        }}
                                        className={`flex-shrink-0 relative group/thumb transition-all duration-300 ${
                                            selectedImage === index
                                                ? 'ring-4 ring-cyan-500 dark:ring-cyan-400 scale-105'
                                                : 'ring-2 ring-gray-200 dark:ring-gray-600 hover:ring-cyan-300 dark:hover:ring-cyan-500'
                                        } rounded-xl overflow-hidden`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-20 h-20 object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                                        />

                                        {/* Selected Indicator */}
                                        {selectedImage === index && (
                                            <div
                                                className="absolute inset-0 bg-cyan-500/20 dark:bg-cyan-400/20 border-2 border-cyan-500 dark:border-cyan-400 rounded-xl"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Single Image Placeholder for better UX */}
                        {productImages.length === 1 && (
                            <div className="text-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Scroll over image to zoom</p>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Category & Brand */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            {product.subCategory && (
                                <span
                                    className="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-full font-medium transition-colors duration-300">
                                    {product.subCategory.name || 'Uncategorized'}
                                </span>
                            )}
                            {product.brand && (
                                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors duration-300">{product.brand}</span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full transition-colors duration-300">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                ))}
                                <span className="ml-2 text-gray-700 dark:text-amber-300 font-semibold transition-colors duration-300">4.5</span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">(128 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">৳{product.price?.toFixed(2)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-2xl text-gray-500 dark:text-gray-400 line-through transition-colors duration-300">
                                            ৳{product.originalPrice.toFixed(2)}
                                        </span>
                                        <span
                                            className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce transition-colors duration-300">
                                            {discountPercentage}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-green-600 dark:text-green-400 font-medium flex items-center space-x-1 transition-colors duration-300">
                                    <span>🎉</span>
                                    <span>You save ৳{(product.originalPrice - product.price).toFixed(2)}</span>
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl transition-colors duration-300">
                            <div
                                className={`w-3 h-3 rounded-full animate-pulse ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'} transition-colors duration-300`}></div>
                            <span
                                className={product.stock > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold transition-colors duration-300'}>
                                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Description</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                                {product.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">Key Features</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index}
                                            className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 group/feature transition-colors duration-300">
                                            <div
                                                className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full group-hover/feature:scale-150 transition-transform duration-300"></div>
                                            <span
                                                className="group-hover/feature:text-cyan-700 dark:group-hover/feature:text-cyan-400 transition-colors duration-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Quantity:</span>
                            <div
                                className="flex items-center space-x-3 border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden transition-colors duration-300">
                                <button
                                    onClick={decreaseQuantity}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                                </button>
                                <span className="px-6 py-3 font-semibold text-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300">{quantity}</span>
                                <button
                                    onClick={increaseQuantity}
                                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400"/>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addingToCart || loading || !authState.isAuthenticated}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
                            >
                                <ShoppingCart className="w-6 h-6"/>
                                <span className="text-lg">
                                    {!authState.isAuthenticated ? 'Login to Add' : addingToCart ? 'Adding...' : 'Add to Cart'}
                                </span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0 || addingToCart || loading || !authState.isAuthenticated}
                                className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
                            >
                                <span className="text-lg">
                                    {!authState.isAuthenticated ? 'Login to Buy' : addingToCart ? 'Adding...' : 'Buy Now'}
                                </span>
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`flex items-center space-x-3 px-6 py-3 rounded-xl border transition-all duration-300 ${
                                    isWishlisted
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 shadow-lg scale-105'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                                } ${!authState.isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!authState.isAuthenticated}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current animate-pulse' : ''}`}/>
                                <span className="font-medium">
                                    {!authState.isAuthenticated ? 'Login for Wishlist' : isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                                </span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-3 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 font-medium"
                            >
                                <Share2 className="w-5 h-5"/>
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl transition-colors duration-300">
                                <Truck className="w-10 h-10 text-cyan-600 dark:text-cyan-400"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">Free Delivery</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Delivery within 2-3 days</p>
                                </div>
                            </div>
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl transition-colors duration-300">
                                <Shield className="w-10 h-10 text-green-600 dark:text-green-400"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">1 Year Warranty</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Manufacturer warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center transition-colors duration-300">Product Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key}
                                     className="flex justify-between items-center py-4 px-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors duration-300 group">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors duration-300">{key}</span>
                                    <span className="text-gray-900 dark:text-white font-medium transition-colors duration-300">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;