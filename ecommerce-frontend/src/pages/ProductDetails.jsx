import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, Plus, Minus, ZoomIn} from 'lucide-react';
import {productService} from '../api/product-api';

const ProductDetails = () => {
    const {productId} = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [error, setError] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({x: 0, y: 0});

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

    const handleAddToCart = () => {
        console.log('Added to cart:', {...product, quantity});
    };

    const handleBuyNow = () => {
        console.log('Buy now:', {...product, quantity});
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            });
        }
    };

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
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
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 group"
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
                            className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden group">
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
                                            className={`absolute top-4 right-4 bg-black/70 text-white p-2 rounded-full transition-all duration-300 ${
                                                isZoomed ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                                            }`}>
                                            <ZoomIn className="w-5 h-5"/>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                                        <span className="text-6xl text-gray-400 mb-4">📦</span>
                                        <p className="text-gray-500 text-lg">No Image Available</p>
                                    </div>
                                )}

                                {/* Loading Animation */}
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
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
                                                ? 'ring-4 ring-cyan-500 scale-105'
                                                : 'ring-2 ring-gray-200 hover:ring-cyan-300'
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
                                                className="absolute inset-0 bg-cyan-500/20 border-2 border-cyan-500 rounded-xl"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Single Image Placeholder for better UX */}
                        {productImages.length === 1 && (
                            <div className="text-center">
                                <p className="text-gray-500 text-sm">Scroll over image to zoom</p>
                            </div>
                        )}
                    </div>

                    {/* Product Info - Rest of the code remains the same */}
                    <div className="space-y-6">
                        {/* Category & Brand */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {product.subCategory && (
                                <span
                                    className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-3 py-1 rounded-full font-medium">
                                    {product.subCategory.name || 'Uncategorized'}
                                </span>
                            )}
                            {product.brand && (
                                <span className="bg-gray-100 px-3 py-1 rounded-full">{product.brand}</span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1 rounded-full">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < 4 ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                                <span className="ml-2 text-gray-700 font-semibold">4.5</span>
                            </div>
                            <span className="text-gray-500">(128 reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-bold text-gray-900">৳{product.price?.toFixed(2)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-2xl text-gray-500 line-through">
                                            ৳{product.originalPrice.toFixed(2)}
                                        </span>
                                        <span
                                            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                            {discountPercentage}% OFF
                                        </span>
                                    </>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-green-600 font-medium flex items-center space-x-1">
                                    <span>🎉</span>
                                    <span>You save ৳{(product.originalPrice - product.price).toFixed(2)}</span>
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
                            <div
                                className={`w-3 h-3 rounded-full animate-pulse ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span
                                className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {product.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="bg-white p-4 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index}
                                            className="flex items-center space-x-3 text-gray-700 group/feature">
                                            <div
                                                className="w-2 h-2 bg-cyan-500 rounded-full group-hover/feature:scale-150 transition-transform duration-300"></div>
                                            <span
                                                className="group-hover/feature:text-cyan-700 transition-colors duration-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                            <span className="text-lg font-semibold text-gray-900">Quantity:</span>
                            <div
                                className="flex items-center space-x-3 border border-gray-300 rounded-xl overflow-hidden">
                                <button
                                    onClick={decreaseQuantity}
                                    className="p-3 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4"/>
                                </button>
                                <span className="px-6 py-3 font-semibold text-lg bg-gray-50">{quantity}</span>
                                <button
                                    onClick={increaseQuantity}
                                    className="p-3 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
                            >
                                <ShoppingCart className="w-6 h-6"/>
                                <span className="text-lg">Add to Cart</span>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
                            >
                                <span className="text-lg">Buy Now</span>
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`flex items-center space-x-3 px-6 py-3 rounded-xl border transition-all duration-300 ${
                                    isWishlisted
                                        ? 'bg-red-50 border-red-200 text-red-600 shadow-lg scale-105'
                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:scale-105'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current animate-pulse' : ''}`}/>
                                <span className="font-medium">{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center space-x-3 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all duration-300 font-medium"
                            >
                                <Share2 className="w-5 h-5"/>
                                <span>Share</span>
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                                <Truck className="w-10 h-10 text-cyan-600"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Free Delivery</h4>
                                    <p className="text-sm text-gray-600">Delivery within 2-3 days</p>
                                </div>
                            </div>
                            <div
                                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <Shield className="w-10 h-10 text-green-600"/>
                                <div>
                                    <h4 className="font-semibold text-gray-900">1 Year Warranty</h4>
                                    <p className="text-sm text-gray-600">Manufacturer warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Product Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key}
                                     className="flex justify-between items-center py-4 px-6 bg-gray-50 rounded-xl hover:bg-cyan-50 transition-colors duration-300 group">
                                    <span className="font-semibold text-gray-700 group-hover:text-cyan-700">{key}</span>
                                    <span className="text-gray-900 font-medium">{value}</span>
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