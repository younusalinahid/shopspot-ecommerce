import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllBanners } from "../../api/banner-api-service";

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getAllBanners()
            .then(data => {
                const activeBanners = data
                    .filter(banner => banner.active)
                    .sort((a, b) => a.orderIndex - b.orderIndex);
                setBanners(activeBanners);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error loading banners:', err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    const nextBanner = () => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const getImageSrc = (imageData) => {
        if (!imageData) return null;
        return `data:image/jpeg;base64,${imageData}`;
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 mx-4 my-6 rounded-2xl h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    // If banners exist, show carousel
    if (banners.length > 0) {
        return (
            <div className="relative mx-4 my-6 rounded-2xl overflow-hidden group">
                {/* Banner Images */}
                <div className="relative h-64 md:h-80 lg:h-70">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${
                                index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            {banner.linkUrl ? (
                                <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={getImageSrc(banner.imageData)}
                                        alt={banner.title}
                                        className="w-full h-full object-contain bg-gray-200"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Image';
                                        }}
                                    />
                                </a>
                            ) : (
                                <div className="relative w-full aspect-[3/1] overflow-hidden rounded-2xl">
                                    <img
                                        src={getImageSrc(banner.imageData)}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/1200x400?text=Banner+Image';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Banner Title Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                                <h2 className="text-white text-2xl md:text-3xl font-bold">
                                    {banner.title}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={prevBanner}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextBanner}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentBannerIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentBannerIndex
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Fallback default banner if no banners available
    return (
        <div className="bg-gradient-to-r from-cyan-100 to-cyan-200 mx-4 my-6 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-8">
                <div className="flex-1 space-y-4">
                    <h2 className="font-bold text-cyan-800 text-3xl">Embrace Your Heritage</h2>
                    <h3 className="font-bold text-gray-700 text-2xl">Wear Tradition with Style</h3>

                    <div className="flex items-center space-x-6 text-white">
                        <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                            <span className="font-semibold">Flat $5 Cashback</span>
                        </div>
                        <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                            <span className="font-semibold">Up to 20% Off</span>
                        </div>
                        <div className="bg-cyan-500 px-4 py-2 rounded-lg">
                            <span className="font-semibold">Free Delivery</span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <div className="relative flex justify-center items-center bg-cyan-300 rounded-2xl w-64 h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-cyan-400"></div>
                        <div className="relative text-6xl">👘</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;