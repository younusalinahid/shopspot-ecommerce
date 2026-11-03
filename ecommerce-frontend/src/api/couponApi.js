import axiosInstance from './axiosConfig';
import {ADMIN_URL, PUBLIC_URL} from './config';

const ADMIN_API = `${ADMIN_URL}/coupons`;

export const couponApi = {
    // Preview only: the backend works out the discount again when the order is placed
    validate: async (code, subtotal) => {
        const res = await axiosInstance.post(`${PUBLIC_URL}/coupons/validate`, {code, subtotal});
        return res.data;
    },

    // ── Admin ──────────────────────────────────────────────
    getAll: async () => {
        const res = await axiosInstance.get(ADMIN_API);
        return res.data;
    },

    create: async (coupon) => {
        const res = await axiosInstance.post(ADMIN_API, coupon);
        return res.data;
    },

    update: async (id, coupon) => {
        const res = await axiosInstance.put(`${ADMIN_API}/${id}`, coupon);
        return res.data;
    },

    remove: async (id) => {
        await axiosInstance.delete(`${ADMIN_API}/${id}`);
    },
};
