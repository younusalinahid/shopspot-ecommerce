import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from '../api/cart-api-service';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    const isLoggedIn = useCallback(() => !!localStorage.getItem('token'), []);

    const fetchCart = useCallback(async () => {
        if (!isLoggedIn()) {
            setCart({ items: [], totalPrice: 0, totalItems: 0 });
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const result = await getCart();
            setCart(result.success
                ? result.data
                : { items: [], totalPrice: 0, totalItems: 0 }
            );
        } catch {
            setCart({ items: [], totalPrice: 0, totalItems: 0 });
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);

    const handleAddToCart = async (productId, quantity = 1, size = null, color = null) => {
        if (!isLoggedIn()) return { success: false };
        const result = await addToCart(productId, quantity, size, color);
        if (result.success) setCart(result.data);
        return result;
    };

    const handleUpdateCartItem = async (cartItemId, quantity) => {
        if (!isLoggedIn()) return { success: false };
        const result = await updateCartItem(cartItemId, quantity);
        if (result.success) setCart(result.data);
        return result;
    };

    const handleRemoveCartItem = async (cartItemId) => {
        if (!isLoggedIn()) return { success: false };

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
        if (!isLoggedIn()) return { success: false };

        const previousCart = cart;
        setCart({ items: [], totalPrice: 0, totalItems: 0 });

        const result = await clearCart();
        if (!result.success) setCart(previousCart);
        return result;
    };

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            fetchCart,
            addToCart:      handleAddToCart,
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            clearCart:      handleClearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};