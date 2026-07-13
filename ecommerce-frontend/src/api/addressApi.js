import axiosInstance from './axiosConfig';
import { USER_URL } from "./config";

export const addressApi = {

    getAll: async () => {
        const res = await axiosInstance.get(USER_URL);
        return res.data;
    },

    add: async (data) => {
        const res = await axiosInstance.post(USER_URL, data);
        return res.data;
    },

    update: async (id, data) => {
        const res = await axiosInstance.put(`${USER_URL}/${id}`, data);
        return res.data;
    },

    remove: async (id) => {
        await axiosInstance.delete(`${USER_URL}/${id}`);
    },

    setDefault: async (id) => {
        const res = await axiosInstance.put(`${USER_URL}/${id}/default`);
        return res.data;
    },
};