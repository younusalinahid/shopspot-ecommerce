import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import {Heart, GitCompareArrows} from 'lucide-react';
import {imageSrc} from '../../utils/imageSrc';
import {useWishlist} from '../../hooks/useWishlist';

export default function ProductCard({ product, showDiscount = false }) {

    const [imageError, setImageError] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const {isWishlisted, toggle} = useWishlist();

    if (!product) return null;

    const isOutOfStock = product.stock !== undefined && Number(product.stock) <= 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) {
            toast.info('This product is out of stock');
            return;
        }
        addToCart(product.id, 1).then((result) => {
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

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const added = await toggle(product.id);
            toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (err) {
            if (err.loginRequired) {
                toast.info('Please login to save products');
                window.dispatchEvent(new Event('openLogin'));
            } else {
                toast.error('Could not update wishlist');
            }
        }
    };

    const hasDiscount = Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
    const discountPercentage = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const imageSource = imageSrc(product.imageData);
    const wished = isWishlisted(product.id);
    const subtitle = product.subCategoryName || product.categoryName || '';
    const [whole, cents] = Number(product.price || 0).toFixed(2).split('.');
    const openProduct = () => navigate(`/product/${product.id}`);

    return (
        <div className="group w-full flex flex-col">
            {/* Image */}
            <div
                className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden cursor-pointer"
                onClick={openProduct}
            >
                {imageSource && !imageError ? (
                    <img src={imageSource} alt={product.name} loading="lazy"
                         className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                         onError={() => setImageError(true)}/>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1.5">
                    {isOutOfStock && (
                        <span className="bg-gray-900/85 text-white text-xs font-semibold px-2.5 py-1 rounded-full">Out of stock</span>
                    )}
                    {hasDiscount && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discountPercentage}%</span>
                    )}
                </div>

                {/* Wishlist + compare */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col gap-2">
                    <button type="button" onClick={handleWishlist}
                            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished}
                            title={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                            className="w-9 h-9 rounded-full bg-white/95 dark:bg-gray-900/90 shadow flex items-center justify-center hover:scale-110 transition-transform">
                        <Heart size={18} className={wished ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-200'}/>
                    </button>
                    <button type="button" onClick={handleCompare} aria-label="Add to compare" title="Compare"
                            className="w-9 h-9 rounded-full bg-white/95 dark:bg-gray-900/90 shadow flex items-center justify-center text-gray-700 dark:text-gray-200 hover:scale-110 transition-all lg:opacity-0 lg:group-hover:opacity-100">
                        <GitCompareArrows size={17}/>
                    </button>
                </div>
            </div>

            {/* Details */}
            <div className="mt-3 px-0.5 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2 cursor-pointer" onClick={openProduct}>
                    <h3 className="text-gray-900 dark:text-white font-semibold text-[15px] sm:text-base leading-snug line-clamp-2" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-gray-900 dark:text-white font-bold text-base sm:text-lg leading-snug whitespace-nowrap">
                        ৳{Number(whole).toLocaleString('en-IN')}<sup className="text-[0.6em] font-semibold ml-0.5">.{cents}</sup>
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 mt-1 text-sm min-h-[1.25rem]">
                    <span className="text-gray-500 dark:text-gray-400 truncate">{subtitle}</span>
                    {hasDiscount && (
                        <span className="text-gray-400 line-through whitespace-nowrap">৳{Number(product.originalPrice).toLocaleString('en-IN')}</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="mt-3 self-start px-5 py-2 rounded-full border-2 border-emerald-900 dark:border-emerald-400 text-emerald-900 dark:text-emerald-300 text-sm font-semibold transition-colors hover:bg-emerald-900 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-gray-900 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent dark:disabled:border-gray-600 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                    {isOutOfStock ? 'Out of stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
