import axiosInstance from './axiosConfig';
import { USER_URL } from "./config";

// Backend: AddressController -> /api/user/addresses
const ADDRESS_URL = `${USER_URL}/addresses`;

export const addressApi = {

    getAll: async () => {
        const res = await axiosInstance.get(ADDRESS_URL);
        return res.data;
    },

    add: async (data) => {
        const res = await axiosInstance.post(ADDRESS_URL, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await axiosInstance.put(`${ADDRESS_URL}/${id}`, data);
        return res.data;
    },

    remove: async (id) => {
        await axiosInstance.delete(`${ADDRESS_URL}/${id}`);
    },

    setDefault: async (id) => {
        const res = await axiosInstance.put(`${ADDRESS_URL}/${id}/default`);
        return res.data;
    },
};