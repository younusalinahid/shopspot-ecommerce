import axios from "axios";

const BASE_URL = "http://localhost:8080/api/public/chat";

export const chatApi = {
    sendMessage: async (messages) => {
        const res = await axios.post(BASE_URL, { messages });
        return res.data;
    }
};