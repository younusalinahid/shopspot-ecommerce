import axiosInstance from './axiosConfig';

const ORDER_API   = '/api/user/orders';
const ADMIN_ORDER = '/api/admin/orders';

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

    getUserOrders: async () => {
        const res = await axiosInstance.get(ORDER_API);
        return res.data;
    },

    getOrderById: async (orderId) => {
        const res = await axiosInstance.get(`${ORDER_API}/${orderId}`);
        return res.data;
    },

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
};