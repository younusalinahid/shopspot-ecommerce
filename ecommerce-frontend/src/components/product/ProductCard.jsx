import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import {imageSrc} from '../../utils/imageSrc';

export default function ProductCard({ product, showDiscount = false }) {

    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    if (!product) return null;

    const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) {
            toast.info('This product is out of stock');
            return;
        }
        if (product.sizes?.length > 1) {
            toast.info('Please choose a size');
            navigate(`/product/${product.id}`);
            return;
        }
        addToCart(product.id, 1, product.sizes?.[0] || null).then((result) => {
            if (result?.success) toast.success('Added to cart!');
            else if (!result?.deactivated) toast.error(result?.error || 'Failed to add');
        }).catch(() => {
            toast.error('Failed to add');
        });
    };

    const handleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const existingList = JSON.parse(localStorage.getItem('productCompareList') || '[]');

        if (existingList.length >= 5) {
            toast.error("You can compare up to 5 products only!");
            return;
        }

        const isExists = existingList.find(i => (i.id || i._id) === product.id);

        if (!isExists) {
            const newList = [...existingList, product];
            localStorage.setItem('productCompareList', JSON.stringify(newList));
            toast.success('Added to compare list!');
        } else {
            toast.info('Already in compare list!');
        }
    };

    const hasDiscount = Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
    const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const imageSource = imageSrc(product.imageData);

    return (
        <div className="group w-full relative">
            <div
                className="relative bg-gray-50 dark:bg-gray-800 h-52 sm:h-72 lg:h-96 w-full flex items-center justify-center overflow-hidden rounded-xl cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {imageSource && !imageError ? (
                    <img src={imageSource} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" onError={() => setImageError(true)} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}

                {isOutOfStock && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gray-900/80 text-white text-xs sm:text-xs font-semibold px-2 py-1 rounded-md z-10">
                        Out of stock
                    </span>
                )}

                <div className="absolute bottom-2 sm:bottom-6 flex items-center justify-center gap-2 sm:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 z-10">
                    {/* Add to Cart with Tooltip */}
                    <div className="relative group/tooltip">
                        <div onClick={handleAddToCart} aria-label="Add to cart" aria-disabled={isOutOfStock} role="button" className={`p-2.5 sm:p-3 bg-white text-gray-900 rounded-full shadow-xl transition-all ${isOutOfStock ? "opacity-40 cursor-not-allowed" : "hover:bg-cyan-500 hover:text-white cursor-pointer"}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </div>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add to Cart</span>
                    </div>

                    {/* Compare with Tooltip */}
                    <div className="relative group/tooltip">
                        <div onClick={handleCompare} aria-label="Add to compare" role="button" className="p-2.5 sm:p-3 bg-white hover:bg-cyan-500 hover:text-white text-gray-900 rounded-full shadow-xl transition-all cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
                        </div>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Compare</span>
                    </div>
                </div>
            </div>

            <div className="mt-2 sm:mt-4 px-1 cursor-pointer flex flex-col items-center justify-center text-center" onClick={() => navigate(`/product/${product.id}`)}>
                <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base truncate w-full" title={product.name}>{product.name}</h3>

                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mt-1">
                    {hasDiscount && (
                        <span className="text-gray-400 line-through text-xs sm:text-sm">৳{Number(product.originalPrice).toFixed(2)}</span>
                    )}
                    <div className="flex items-center gap-1">
                        <p className="text-gray-900 dark:text-white font-bold text-base sm:text-lg">৳{Number(product.price).toFixed(2)}</p>
                        {hasDiscount && (
                            <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">{discountPercentage}% OFF</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}