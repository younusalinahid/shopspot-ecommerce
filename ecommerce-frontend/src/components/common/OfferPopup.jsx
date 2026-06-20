import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAllProducts } from "../../hooks/useAllProducts";
import { useNavigate, useLocation } from "react-router-dom";

const OfferPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { products, loading } = useAllProducts();
    const navigate = useNavigate();
    const location = useLocation();

    // Filter only discounted products
    const discountedProducts = products.filter(
        (product) => product.discountPercent && product.discountPercent > 0
    );

    // Show popup only once per session on Home page
    useEffect(() => {
        if (location.pathname !== "/") return;
        if (discountedProducts.length === 0) return;

        const hasShown = sessionStorage.getItem("offerPopupShown");

        if (!hasShown) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem("offerPopupShown", "true");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [discountedProducts.length, location.pathname]);

    // Auto slide every 2 seconds
    useEffect(() => {
        if (!isOpen || discountedProducts.length < 2) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % discountedProducts.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [isOpen, discountedProducts.length]);

    // Close with ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen]);

    const closePopup = () => setIsOpen(false);

    const handleShopNow = () => {
        const product = discountedProducts[currentSlide];
        if (product) {
            closePopup();
            navigate(`/product/${product.id}`);
        }
    };

    const getImage = (product) => {
        if (!product?.imageData) return null;
        return product.imageData.startsWith('data:')
            ? product.imageData
            : `data:image/jpeg;base64,${product.imageData}`;
    };

    const handleImageError = (e) => {
        e.target.src = "https://via.placeholder.com/600x600?text=No+Image";
    };

    if (!isOpen || loading || discountedProducts.length === 0) return null;

    const product = discountedProducts[currentSlide];
    const discountedPrice = product.price * (1 - product.discountPercent / 100);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl max-w-[820px] w-full shadow-2xl flex flex-col md:flex-row overflow-hidden relative">

                <button
                    onClick={closePopup}
                    className="absolute top-4 right-4 z-30 text-gray-500 hover:text-gray-800 transition"
                >
                    <X size={24} />
                </button>

                <div className="md:w-1/2 h-[550px] relative">
                    <img
                        src={getImage(product)}
                        alt={product.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow">
                        {product.discountPercent}% OFF
                    </div>
                </div>

                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h2>

                    <div className="mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-bold text-cyan-600">
                                ৳{discountedPrice.toFixed(0)}
                            </span>
                            <span className="text-xl text-gray-400 line-through">
                                ৳{product.price}
                            </span>
                        </div>
                        <p className="text-green-600 font-semibold mt-1">
                            You save ৳{(product.price - discountedPrice).toFixed(0)}
                        </p>
                    </div>

                    <p className="text-gray-500 mb-8">
                        Limited Time Offer • Shop Now &amp; Save!
                    </p>

                    <button
                        onClick={handleShopNow}
                        className="w-full bg-[#00b4d8] hover:bg-[#0096c7] text-white py-4 rounded-2xl font-semibold text-lg transition"
                    >
                        Shop Now
                    </button>

                    <p className="text-xs text-gray-400 mt-5 text-center">
                        T&amp;C apply*
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OfferPopup;