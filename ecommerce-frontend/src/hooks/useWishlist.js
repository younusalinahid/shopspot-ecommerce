import {useEffect, useState} from 'react';
import {wishlistApi} from '../api/wishlistApi';
import {isAuthenticated} from '../api/authApi';

// One shared copy of the wishlist ids for every product card on the page,
// so a grid of 20 cards makes one request instead of 20.
let ids = new Set();
let loadedFor = null;
let loading = null;
const listeners = new Set();

const notify = () => listeners.forEach(fn => fn(new Set(ids)));

const load = () => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated() || !token) {
        ids = new Set();
        loadedFor = null;
        notify();
        return Promise.resolve();
    }
    if (loadedFor === token) return Promise.resolve();
    if (!loading) {
        loading = wishlistApi.getWishlist()
            .then(list => {
                ids = new Set((list || []).map(item => item.productId));
                loadedFor = token;
                notify();
            })
            .catch(() => { /* not logged in or offline: show empty hearts */ })
            .finally(() => { loading = null; });
    }
    return loading;
};

export const useWishlist = () => {
    const [current, setCurrent] = useState(() => new Set(ids));

    useEffect(() => {
        listeners.add(setCurrent);
        load();
        return () => listeners.delete(setCurrent);
    }, []);

    /** Returns true/false for the new state; throws when the user must log in. */
    const toggle = async (productId) => {
        if (!isAuthenticated()) {
            const err = new Error('LOGIN_REQUIRED');
            err.loginRequired = true;
            throw err;
        }
        const res = await wishlistApi.toggleWishlist(productId);
        if (res.wishlisted) ids.add(productId); else ids.delete(productId);
        notify();
        return res.wishlisted;
    };

    return {isWishlisted: (id) => current.has(id), toggle};
};
