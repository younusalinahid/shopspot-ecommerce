import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('User not logged in');
                setCart({ items: [], totalPrice: 0, totalItems: 0 });
                return;
            }

            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/cart', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Cart data received:', response.data);
            setCart(response.data);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
            setCart({ items: [], totalPrice: 0, totalItems: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = async (productId, quantity = 1, size = null, color = null) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first to add items to cart');
                return { success: false, error: 'User not logged in' };
            }

            const requestData = {
                productId: productId,
                quantity: quantity,
                size: size,
                color: color
            };

            console.log('Adding to cart:', requestData);

            const response = await axios.post(
                'http://localhost:8080/api/cart/items',
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Add to cart response:', response.data);
            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Failed to add to cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add product to cart';
            return { success: false, error: errorMessage };
        }
    };

    const updateCartItem = async (cartItemId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8080/api/cart/items/${cartItemId}?quantity=${quantity}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setCart(response.data);
            return { success: true };
        } catch (error) {
            console.error('Failed to update cart item:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update cart item';
            return { success: false, error: errorMessage };
        }
    };

    const removeCartItem = async (cartItemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:8080/api/cart/items/${cartItemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchCart();
            return { success: true };
        } catch (error) {
            console.error('Failed to remove cart item:', error);
            const errorMessage = error.response?.data?.message || 'Failed to remove cart item';
            return { success: false, error: errorMessage };
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                'http://localhost:8080/api/cart',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setCart({ items: [], totalPrice: 0, totalItems: 0 });
            return { success: true };
        } catch (error) {
            console.error('Failed to clear cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to clear cart';
            return { success: false, error: errorMessage };
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        } else {
            setCart({ items: [], totalPrice: 0, totalItems: 0 });
        }
    }, [fetchCart]);

    const value = {
        cart,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};