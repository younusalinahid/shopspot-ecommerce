import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from "../api/axiosConfig";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    // Get user ID from localStorage
    const getUserId = () => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                return parsedUser.id || parsedUser.userId;
            } catch (error) {
                console.error('Error parsing user:', error);
                return null;
            }
        }
        return null;
    };

    // Fetch cart data
    const fetchCart = async () => {
        const userId = getUserId();

        if (!userId) {
            setCart(null);
            setCartCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(`/cart/${userId}`);
            const cartData = response.data;
            setCart(cartData);
            setCartCount(cartData.totalItems || 0);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCart(null);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (productId, quantity = 1) => {
        const userId = getUserId();

        if (!userId) {
            toast.error('Please login to add items to cart');
            return;
        }

        try {
            const response = await apiClient.post(
                `/cart/${userId}/add?productId=${productId}&quantity=${quantity}`
            );
            const updatedCart = response.data;
            setCart(updatedCart);
            setCartCount(updatedCart.totalItems || 0);
            toast.success('Item added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
            throw error;
        }
    };

    // Update cart item quantity
    const updateCartItem = async (productId, quantity) => {
        const userId = getUserId();

        if (!userId) {
            toast.error('Please login first');
            return;
        }

        if (quantity <= 0) {
            await removeCartItem(productId);
            return;
        }

        try {
            const response = await apiClient.put(
                `/cart/${userId}/update/${productId}?quantity=${quantity}`
            );
            const updatedCart = response.data;
            setCart(updatedCart);
            setCartCount(updatedCart.totalItems || 0);
            toast.success('Cart updated!');
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
            throw error;
        }
    };

    // Remove item from cart
    const removeCartItem = async (productId) => {
        const userId = getUserId();

        if (!userId) {
            toast.error('Please login first');
            return;
        }

        try {
            const response = await apiClient.delete(
                `/cart/${userId}/remove/${productId}`
            );
            const updatedCart = response.data;
            setCart(updatedCart);
            setCartCount(updatedCart.totalItems || 0);
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
            throw error;
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        const userId = getUserId();

        if (!userId) {
            toast.error('Please login first');
            return;
        }

        try {
            await apiClient.delete(`/cart/${userId}/clear`);
            setCart({ items: [], totalItems: 0, totalPrice: 0 });
            setCartCount(0);
            toast.success('Cart cleared!');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
            throw error;
        }
    };

    // Load cart on mount and when user logs in
    useEffect(() => {
        fetchCart();

        // Listen for auth changes
        const handleAuthChange = () => {
            fetchCart();
        };

        window.addEventListener('userLoggedIn', handleAuthChange);
        window.addEventListener('storage', handleAuthChange);
        window.addEventListener('userLoggedOut', () => {
            setCart(null);
            setCartCount(0);
        });

        return () => {
            window.removeEventListener('userLoggedIn', handleAuthChange);
            window.removeEventListener('storage', handleAuthChange);
            window.removeEventListener('userLoggedOut', handleAuthChange);
        };
    }, []);

    const value = {
        cart,
        loading,
        cartCount,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};