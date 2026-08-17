import axios from "axios";
import { PUBLIC_URL } from "./config";

export const chatApi = {
    sendMessage: async (messages) => {
        const res = await axios.post(`${PUBLIC_URL}/chat`, { messages });
        return res.data;
    }
};