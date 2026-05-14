import axiosInstance from './axiosConfig';

const ADDR_API = '/api/user/addresses';

export const addressApi = {

    getAll: async () => {
        const res = await axiosInstance.get(ADDR_API);
        return res.data;
    },

    add: async (data) => {
        const res = await axiosInstance.post(ADDR_API, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await axiosInstance.put(`${ADDR_API}/${id}`, data);
        return res.data;
    },

    remove: async (id) => {
        await axiosInstance.delete(`${ADDR_API}/${id}`);
    },

    setDefault: async (id) => {
        const res = await axiosInstance.put(`${ADDR_API}/${id}/default`);
        return res.data;
    },
};