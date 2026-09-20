import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getR2Url(key) {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            `${API_URL}/storage/url`,
            {
                params: {
                    key
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data.url;

    } catch (error) {
        console.error(
            "R2 URL ERROR:",
            error.response?.data ||
            error.message
        );

        return null;
    }
}