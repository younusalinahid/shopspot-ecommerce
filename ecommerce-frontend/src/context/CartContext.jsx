import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from '../api/cartApi';
import { productService } from '../api/productApi';
import { isAuthenticated } from '../api/authApi';
import { toast } from "react-toastify";
import {imageSrc} from '../utils/imageSrc';

const CartContext = createContext();

const GUEST_CART_KEY = 'guestCart';
const EMPTY_CART = { items: [], totalPrice: 0, totalItems: 0 };

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

// ── Guest cart (stored in this browser until the visitor logs in or orders) ──

const readGuestItems = () => {
    try {
        const items = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
};

const buildGuestCart = (items) => ({
    guest: true,
    items: items.map((item) => ({
        ...item,
        itemTotal: (item.product?.price || 0) * item.quantity,
    })),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
});

const saveGuestItems = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    return buildGuestCart(items);
};

const guestItemId = (productId, size, color) => `guest-${productId}-${size || ''}-${color || ''}`;

// The product API returns raw base64; the cart page expects a data URL (same as the server cart)
const toImageSrc = (imageData) => {
    return imageSrc(imageData);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const mergingRef = useRef(false);

    const isLoggedIn = useCallback(() => isAuthenticated(), []);

    /** Moves items a visitor added before logging in into their account cart. */
    const mergeGuestCart = useCallback(async () => {
        const guestItems = readGuestItems();
        if (!guestItems.length || mergingRef.current) return;
        mergingRef.current = true;
        try {
            for (const item of guestItems) {
                await addToCart(item.product.id, item.quantity, item.size, item.color);
            }
            localStorage.removeItem(GUEST_CART_KEY);
        } finally {
            mergingRef.current = false;
        }
    }, []);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn()) {
            setCart(buildGuestCart(readGuestItems()));
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            await mergeGuestCart();
            const result = await getCart();
            setCart(result.success ? result.data : EMPTY_CART);
        } catch {
            setCart(EMPTY_CART);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, mergeGuestCart]);

    const isUserActive = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.active !== false;
        } catch { return true; }
    };

    const handleAddToCart = async (productId, quantity = 1, size = null, color = null) => {
        if (!isLoggedIn()) {
            try {
                const items = readGuestItems();
                const id = guestItemId(productId, size, color);
                const existing = items.find((i) => i.id === id);
                // Fresh stock from the server (stock 0 = out of stock)
                const product = await productService.getProductById(productId);
                const stock = Number(product.stock) || 0;
                const alreadyInCart = items
                    .filter((i) => i.product?.id === productId)
                    .reduce((sum, i) => sum + i.quantity, 0);
                if (stock <= 0) {
                    return { success: false, error: 'This product is out of stock' };
                }
                if (alreadyInCart + quantity > stock) {
                    return { success: false, error: `Only ${stock} left in stock` };
                }
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    items.push({
                        id,
                        quantity,
                        size,
                        color,
                        product: {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            originalPrice: product.originalPrice,
                            imageData: toImageSrc(product.imageData),
                            stock: product.stock,
                        },
                    });
                }
                const updated = saveGuestItems(items);
                setCart(updated);
                return { success: true, data: updated };
            } catch {
                return { success: false, error: 'Could not add product' };
            }
        }

        if (!isUserActive()) {
            toast.error('Your account has been deactivated. Please contact support.');
            return { success: false, deactivated: true };
        }
        const result = await addToCart(productId, quantity, size, color);
        if (result.success) setCart(result.data);
        return result;
    };

    const handleUpdateCartItem = async (cartItemId, quantity) => {
        if (!isLoggedIn()) {
            const target = readGuestItems().find((i) => i.id === cartItemId);
            const stock = Number(target?.product?.stock);
            if (target && quantity > target.quantity && !Number.isNaN(stock) && quantity > stock) {
                return { success: false, error: `Only ${stock} left in stock` };
            }
            const items = readGuestItems()
                .map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
                .filter((i) => i.quantity > 0);
            const updated = saveGuestItems(items);
            setCart(updated);
            return { success: true, data: updated };
        }
        const result = await updateCartItem(cartItemId, quantity);
        if (result.success) setCart(result.data);
        return result;
    };

    const handleRemoveCartItem = async (cartItemId) => {
        if (!isLoggedIn()) {
            const updated = saveGuestItems(readGuestItems().filter((i) => i.id !== cartItemId));
            setCart(updated);
            return { success: true };
        }

        const previousCart = cart;

        setCart(prev => {
            const removedItem = prev.items.find(i => i.id === cartItemId);
            const itemPrice  = (removedItem?.product?.price || 0) * (removedItem?.quantity || 0);
            return {
                ...prev,
                items:      prev.items.filter(i => i.id !== cartItemId),
                totalItems: Math.max(0, (prev.totalItems || 0) - (removedItem?.quantity || 0)),
                totalPrice: Math.max(0, (prev.totalPrice || 0) - itemPrice)
            };
        });
        const result = await removeCartItem(cartItemId);
        if (!result.success) {
            setCart(previousCart);
        }

        return result;
    };

    const handleClearCart = async () => {
        if (!isLoggedIn()) {
            localStorage.removeItem(GUEST_CART_KEY);
            setCart(EMPTY_CART);
            return { success: true };
        }

        const previousCart = cart;
        setCart(EMPTY_CART);

        const result = await clearCart();
        if (!result.success) setCart(previousCart);
        return result;
    };

    useEffect(() => {
        fetchCart();
        // Reload the cart when the user logs in or out (guest items are merged on login)
        const reload = () => fetchCart();
        window.addEventListener('userLoggedIn', reload);
        window.addEventListener('userLoggedOut', reload);
        return () => {
            window.removeEventListener('userLoggedIn', reload);
            window.removeEventListener('userLoggedOut', reload);
        };
    }, [fetchCart]);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            fetchCart,
            isGuest: !isLoggedIn(),
            addToCart:      handleAddToCart,
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            clearCart:      handleClearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
