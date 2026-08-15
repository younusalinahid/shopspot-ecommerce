import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function ProductCard({ product, showDiscount = false }) {

    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    if (!product) return null;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product.id, 1).then(() => {
            toast.success('Added to cart!');
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
    const imageSource = product.imageData ? (product.imageData.startsWith('data:') ? product.imageData : `data:image/jpeg;base64,${product.imageData}`) : null;

    return (
        <div className="group w-full relative">
            <div
                className="relative bg-gray-50 dark:bg-gray-800 h-96 w-full flex items-center justify-center overflow-hidden rounded-xl cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {imageSource && !imageError ? (
                    <img src={imageSource} alt={product.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" onError={() => setImageError(true)} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}

                <div className="absolute bottom-6 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
                    {/* Add to Cart with Tooltip */}
                    <div className="relative group/tooltip">
                        <div onClick={handleAddToCart} className="p-3 bg-white hover:bg-cyan-500 hover:text-white text-gray-900 rounded-full shadow-xl transition-all cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </div>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Add to Cart</span>
                    </div>

                    {/* Compare with Tooltip */}
                    <div className="relative group/tooltip">
                        <div onClick={handleCompare} className="p-3 bg-white hover:bg-cyan-500 hover:text-white text-gray-900 rounded-full shadow-xl transition-all cursor-pointer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
                        </div>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Compare</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 px-1 cursor-pointer flex flex-col items-center justify-center text-center" onClick={() => navigate(`/product/${product.id}`)}>
                <h3 className="text-gray-800 dark:text-gray-100 font-medium text-sm truncate w-full">{product.name}</h3>

                <div className="flex items-center gap-2 mt-1">
                    {hasDiscount && (
                        <span className="text-gray-400 line-through text-xs">৳{Number(product.originalPrice).toFixed(2)}</span>
                    )}
                    <div className="flex items-center gap-1">
                        <p className="text-gray-900 dark:text-white font-bold text-base">৳{Number(product.price).toFixed(2)}</p>
                        {hasDiscount && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{discountPercentage}% OFF</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}