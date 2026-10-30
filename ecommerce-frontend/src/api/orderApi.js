import axiosInstance from './axiosConfig';
import { ADMIN_URL, USER_URL, PUBLIC_URL } from "./config";

const ORDER_API = `${USER_URL}/orders`;
const GUEST_ORDER_API = `${PUBLIC_URL}/orders/guest`;
const GUEST_ORDERS_KEY = 'guestOrders';

/** Guest order tokens are kept in this browser so the visitor can see their order later. */
export const guestOrderStore = {
    save: (orderId, token) => {
        try {
            const all = JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || '{}');
            all[orderId] = token;
            localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(all));
        } catch { /* ignore storage errors */ }
    },
    get: (orderId) => {
        try {
            return JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || '{}')[orderId] || null;
        } catch {
            return null;
        }
    },
};
const ADMIN_ORDER = `${ADMIN_URL}/orders`;

export const orderApi = {

    createOrder: async (checkoutData) => {
        const res = await axiosInstance.post(`${ORDER_API}/checkout`, checkoutData);
        return res.data;
    },

    confirmPayment: async (orderId, paymentIntentId) => {
        const res = await axiosInstance.post(`${ORDER_API}/confirm-payment`, {
            orderId,
            paymentIntentId
        });
        return res.data;
    },

    confirmCODOrder: async (orderId) => {
        const res = await axiosInstance.post(`${ORDER_API}/${orderId}/confirm-cod`);
        return res.data;
    },

    getUserOrders: async () => {
        const res = await axiosInstance.get(ORDER_API);
        return res.data;
    },

    getOrderById: async (orderId) => {
        const res = await axiosInstance.get(`${ORDER_API}/${orderId}`);
        return res.data;
    },

    cancelOrder: async (id) => {
        const res = await axiosInstance.put(`${ORDER_API}/${id}/cancel`);
        return res.data;
    },

    // ── Guest (no login) ──────────────────────────────────
    guestCheckout: async (checkoutData) => {
        const res = await axiosInstance.post(`${GUEST_ORDER_API}/checkout`, checkoutData);
        return res.data;
    },

    confirmGuestCOD: async (orderId, guestToken) => {
        const res = await axiosInstance.post(`${GUEST_ORDER_API}/${orderId}/confirm-cod`, { guestToken });
        return res.data;
    },

    confirmGuestPayment: async (orderId, paymentIntentId, guestToken) => {
        const res = await axiosInstance.post(`${GUEST_ORDER_API}/${orderId}/confirm-payment`, {
            paymentIntentId,
            guestToken
        });
        return res.data;
    },

    getGuestOrder: async (orderId, guestToken) => {
        const res = await axiosInstance.get(`${GUEST_ORDER_API}/${orderId}`, {
            headers: { 'X-Guest-Token': guestToken }
        });
        return res.data;
    },

    // ── Admin ──────────────────────────────────────────────
    getAllOrders: async () => {
        const res = await axiosInstance.get(ADMIN_ORDER);
        return res.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const res = await axiosInstance.put(
            `${ADMIN_ORDER}/${orderId}/status`,
            null,
            { params: { status } }
        );
        return res.data;
    },

    getOrdersByPaymentMethod: async (paymentMethod) => {
        const res = await axiosInstance.get(
            `${ADMIN_ORDER}/filter`,
            { params: { paymentMethod } }
        );
        return res.data;
    },

    markCODCollected: async (orderId) => {
        const res = await axiosInstance.put(
            `${ADMIN_ORDER}/${orderId}/mark-cod-collected`
        );
        return res.data;
    },
};