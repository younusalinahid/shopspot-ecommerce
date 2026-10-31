import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveBanners } from "../../api/bannerApi";

const AUTOPLAY_MS = 5000;

/** Detects the real image type from the base64 header (PNG, WebP or JPEG). */
const getImageSrc = (imageData) => {
    if (!imageData) return null;
    if (imageData.startsWith('data:')) return imageData;
    const mime = imageData.startsWith('iVBOR') ? 'image/png'
        : imageData.startsWith('UklGR') ? 'image/webp'
            : 'image/jpeg';
    return `data:${mime};base64,${imageData}`;
};

/** Internal links ("/category/3") stay in the app; full URLs open in a new tab. */
const BannerLink = ({ url, children, tabIndex }) => {
    if (!url) return children;
    if (url.startsWith('/')) {
        return <Link to={url} tabIndex={tabIndex} className="block w-full h-full">{children}</Link>;
    }
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" tabIndex={tabIndex} className="block w-full h-full">
            {children}
        </a>
    );
};

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);

    useEffect(() => {
        getActiveBanners()
            .then(data => {
                const activeBanners = (Array.isArray(data) ? data : [])
                    .filter(b => b.imageData)
                    .sort((a, b) => a.orderIndex - b.orderIndex);
                setBanners(activeBanners);
            })
            .catch(err => console.error('Error loading banners:', err))
            .finally(() => setIsLoading(false));
    }, []);

    // Restart the timer after every slide change, so a manual click gets the full 5 seconds
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;
        const timer = setTimeout(() => {
            setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
        }, AUTOPLAY_MS);
        return () => clearTimeout(timer);
    }, [banners.length, currentBannerIndex, isPaused]);

    const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);

    // Swipe left/right on touch screens
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null || banners.length <= 1) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 40) (delta < 0 ? nextBanner : prevBanner)();
        touchStartX.current = null;
    };

    // Loading state (same 3:1 shape as the real banner, so the page does not jump)
    if (isLoading) {
        return (
            <div className="mx-3 sm:mx-4 my-4 sm:my-6 rounded-2xl w-auto aspect-[3/1] bg-gray-200 dark:bg-gray-800 animate-pulse"/>
        );
    }

    // If banners exist, show carousel
    if (banners.length > 0) {
        return (
            <div
                className="relative mx-3 sm:mx-4 my-4 sm:my-6 rounded-2xl overflow-hidden group bg-gray-200 dark:bg-gray-800"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-roledescription="carousel"
            >
                {/* Banner Images: height follows the 3:1 banner ratio so mobile has no empty space */}
                <div className="relative w-full aspect-[3/1]">
                    {banners.map((banner, index) => {
                        const isActive = index === currentBannerIndex;
                        return (
                            <div
                                key={banner.id}
                                // Hidden slides must not catch clicks, otherwise the last banner's link always opens
                                className={`absolute inset-0 transition-opacity duration-700 ${
                                    isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                                }`}
                                aria-hidden={!isActive}
                            >
                                <BannerLink url={banner.linkUrl} tabIndex={isActive ? 0 : -1}>
                                    <img
                                        src={getImageSrc(banner.imageData)}
                                        alt={banner.title || 'ShopSpot offer'}
                                        className="w-full h-full object-cover"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                        draggable={false}
                                    />
                                </BannerLink>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Arrows: hidden on phones (swipe instead), always shown on tablets, on hover for desktop */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={prevBanner}
                            className="absolute z-20 left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-3 rounded-full shadow-lg hidden sm:block opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                        <button
                            onClick={nextBanner}
                            className="absolute z-20 right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 sm:p-3 rounded-full shadow-lg hidden sm:block opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {banners.length > 1 && (
                    <div className="absolute z-20 bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentBannerIndex(index)}
                                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 shadow ${
                                    index === currentBannerIndex
                                        ? 'bg-white w-6 sm:w-8'
                                        : 'bg-white/60 hover:bg-white/80 w-1.5 sm:w-2'
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
        <div className="bg-gradient-to-r from-cyan-100 to-cyan-200 mx-3 sm:mx-4 my-4 sm:my-6 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center gap-4 p-5 sm:p-8">
                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                    <h2 className="font-bold text-cyan-800 text-xl sm:text-3xl">Embrace Your Heritage</h2>
                    <h3 className="font-bold text-gray-700 text-lg sm:text-2xl">Wear Tradition with Style</h3>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white text-sm sm:text-base">
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

                <div className="hidden sm:block flex-shrink-0">
                    <div className="relative flex justify-center items-center bg-cyan-300 rounded-2xl w-48 h-36 lg:w-64 lg:h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-cyan-400"></div>
                        <div className="relative text-6xl">👘</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;