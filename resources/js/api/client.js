import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'ngrok-skip-browser-warning': 'true'
    },
    withCredentials: true,
});

export default api;
