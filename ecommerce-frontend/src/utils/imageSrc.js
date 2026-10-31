import {BASE_URL} from '../api/config';

/**
 * Turns whatever the API gives for an image into something <img src> can use:
 * - "/api/public/products/12/image?v=.." (current API) -> backend URL
 * - "data:..." or "http(s)://..." -> unchanged
 * - raw base64 (older responses / saved guest carts) -> data URL
 */
export const imageSrc = (value) => {
    if (!value || typeof value !== 'string') return null;
    if (value.startsWith('data:') || value.startsWith('http') || value.startsWith('blob:')) return value;
    // Not just '/': base64 JPEG data itself starts with "/9j/"
    if (value.startsWith('/api/')) return `${BASE_URL}${value}`;
    return `data:image/jpeg;base64,${value}`;
};
