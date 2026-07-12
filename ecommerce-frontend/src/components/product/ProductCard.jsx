import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ProductCard({ product, showDiscount = false }) {
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleCardClick = () => navigate(`/product/${product.id}`);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            await addToCart(product.id, 1);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add');
        } finally {
            setLoading(false);
        }
    };

    const hasDiscount = Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
    const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const imageSource = product.imageData ? (product.imageData.startsWith('data:') ? product.imageData : `data:image/jpeg;base64,${product.imageData}`) : null;

    return (
        <div onClick={handleCardClick} className="group cursor-pointer w-full">
            {/* Image Container */}
            <div className="relative bg-gray-50 dark:bg-gray-800 h-96 w-full flex items-center justify-center overflow-hidden rounded-lg">

                {/* Discount Badge */}
                {(showDiscount && hasDiscount) && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg z-20">
                        {discountPercentage}% OFF
                    </div>
                )}

                {imageSource && !imageError ? (
                    <img src={imageSource} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" onError={() => setImageError(true)} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}

                {/* Hover Icons (Centered) */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 z-10">
                    <button
                        onClick={handleAddToCart}
                        title="Add to Cart"
                        className="p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full shadow-xl hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-110"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toast.info('Added to compare list!'); }}
                        title="Compare Product"
                        className="p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full shadow-xl hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-110"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
                    </button>
                </div>
            </div>

            {/* Product Name & Price */}
            <div className="mt-4 text-center">
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg truncate px-2">
                    {product.name}
                </h3>
                <div className="flex justify-center items-center gap-2 mt-1">
                    <p className="text-gray-900 dark:text-white font-bold text-md">
                        ৳{Number(product.price).toFixed(2)}
                    </p>
                    {hasDiscount && (
                        <>
                            <p className="text-gray-400 dark:text-gray-500 text-xs line-through">
                                ৳{Number(product.originalPrice).toFixed(2)}
                            </p>
                            <span className="text-red-500 text-xs font-bold">
                                (-{discountPercentage}% OFF)
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}