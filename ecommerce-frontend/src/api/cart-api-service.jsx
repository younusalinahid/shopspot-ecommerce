// src/api/cart-api.js
import axiosInstance from '../config/axiosConfig';

const CART_API_URL = '/api/cart';

// Get user's cart
export const getCart = async () => {
    try {
        const response = await axiosInstance.get(CART_API_URL);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Get cart error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to fetch cart'
        };
    }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    try {
        const response = await axiosInstance.post(`${CART_API_URL}/add`, {
            productId,
            quantity,
            size,
            color
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Add to cart error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to add to cart'
        };
    }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
    try {
        const response = await axiosInstance.put(`${CART_API_URL}/items/${cartItemId}`, {
            quantity
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Update cart item error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to update cart item'
        };
    }
};

// Remove item from cart
export const removeCartItem = async (cartItemId) => {
    try {
        await axiosInstance.delete(`${CART_API_URL}/items/${cartItemId}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Remove cart item error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to remove cart item'
        };
    }
};

// Clear entire cart
export const clearCart = async () => {
    try {
        await axiosInstance.delete(`${CART_API_URL}/clear`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Clear cart error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to clear cart'
        };
    }
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};