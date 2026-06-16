import axiosInstance from './axiosConfig';

const CART_API = '/api/user/cart';

export const getCart = async () => {
    try {
        const res = await axiosInstance.get(CART_API);
        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export const addToCart = async (productId, quantity = 1, size = null, color = null) => {
    try {
        const res = await axiosInstance.post(`${CART_API}/items`, {
            productId,
            quantity,
            size,
            color
        });
        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export const updateCartItem = async (cartItemId, quantity) => {
    try {
        const res = await axiosInstance.put(
            `${CART_API}/items/${cartItemId}`,
            { quantity }
        );
        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export const removeCartItem = async (cartItemId) => {
    try {
        await axiosInstance.delete(`${CART_API}/items/${cartItemId}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

export const clearCart = async () => {
    try {
        await axiosInstance.delete(CART_API);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};


export const getCartByUserId = async (userId) => {
    try {
        const res = await axiosInstance.get(`/api/admin/cart/${userId}`);
        return { success: true, data: res.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};