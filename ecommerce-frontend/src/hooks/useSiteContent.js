import {useEffect, useState} from 'react';
import {siteContentApi, SITE_CONTENT_UPDATED} from '../api/siteContentApi';
import {BASE_URL} from '../api/config';
import SITE_CONTENT_DEFAULTS from '../components/common/siteContentDefaults';

/**
 * Store name, logo, contact info, social links and footer pages managed from
 * Admin -> Site Content. Starts with built-in defaults so nothing flashes empty.
 */
export const useSiteContent = () => {
    const [content, setContent] = useState(SITE_CONTENT_DEFAULTS);

    useEffect(() => {
        let alive = true;
        const load = () => siteContentApi.getPublicContent()
            .then(data => {
                if (alive && data?.settings) {
                    setContent({settings: data.settings, pages: data.pages || []});
                }
            })
            .catch(() => { /* keep the defaults */ });
        load();
        window.addEventListener(SITE_CONTENT_UPDATED, load);
        return () => {
            alive = false;
            window.removeEventListener(SITE_CONTENT_UPDATED, load);
        };
    }, []);

    const settings = content.settings || {};
    // Delivery rule from Admin -> Site Content (same rule the backend uses for the order total)
    const fee = settings.deliveryFee ?? SITE_CONTENT_DEFAULTS.settings.deliveryFee;
    const freeMin = settings.freeDeliveryMin ?? SITE_CONTENT_DEFAULTS.settings.freeDeliveryMin;
    const delivery = {
        fee,
        freeMin,
        chargeFor: (subtotal) => (freeMin > 0 && subtotal > freeMin ? 0 : fee),
    };
    return {
        delivery,
        settings,
        pages: content.pages || [],
        storeName: settings.storeName || 'ShopSpot Online',
        logoUrl: settings.logoUrl ? `${BASE_URL}${settings.logoUrl}` : null,
    };
};
