import {Star} from 'lucide-react';
import {useState} from 'react';
import {Link} from "react-router-dom";

export default function ProductCard({product, showDiscount = false}) {
    const [imageError, setImageError] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Add to cart:', product);
    };

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const getImageSource = () => {
        const imageData = product.imageData || product.imageBase64 || product.imageUrl;

        if (!imageData) return null;

        if (imageData.startsWith('data:')) {
            return imageData;
        }

        return `data:image/jpeg;base64,${imageData}`;
    };

    const imageSource = getImageSource();

    return (
        <Link to={`/product/${product.id}`} className="block flex-shrink-0">
            <div
                className="group bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-cyan-500/20 rounded-xl overflow-hidden transition-all duration-300">
                {/* Product Image - Increased height */}
                <div className="relative bg-gray-100 dark:bg-gray-700 h-80 overflow-hidden transition-colors duration-300">
                    {imageSource && !imageError ? (
                        <img
                            src={imageSource}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                console.error('Image failed to load for:', product.name);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex justify-center items-center bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 transition-colors duration-300">
                            <span className="text-4xl">📦</span>
                        </div>
                    )}

                    {/* Discount Badge */}
                    {(showDiscount && hasDiscount) && (
                        <div
                            className="top-3 right-3 absolute bg-red-500 dark:bg-red-600 px-2 py-1 rounded-full text-white text-xs font-semibold transition-colors duration-300">
                            {discountPercentage}% OFF
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2 min-h-[1rem]">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="fill-current w-3 h-3 text-yellow-400"/>
                        ))}
                        <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs transition-colors duration-300">
                            (4.5)
                        </span>
                    </div>

                    {/* Price and Cart Button */}
                    <div className="flex justify-between items-center">
                        <div className="space-x-2">
                            <span className="font-bold text-gray-900 dark:text-white text-lg transition-colors duration-300">
                                {product.price?.toFixed(2) || '0.00'} Tk
                            </span>
                            {hasDiscount && (
                                <span className="text-gray-500 dark:text-gray-400 text-sm line-through transition-colors duration-300">
                                    {product.originalPrice.toFixed(2)} TK
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 px-4 py-2 rounded-lg text-white text-sm transition-colors duration-300"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}