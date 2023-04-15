const axios = require("axios");

const instance = axios.create({
    baseURL: process.env.SOLY_PAY_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
instance.interceptors.request.use(
    (config) => {
        config.headers["Authorization"] = `Bearer ${process.env.SOLY_PAY_API_KEY}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
exports.api = instance;