import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    // We removed 'withCredentials' because we are using tokens, not cookies!
});

// This "Interceptor" automatically attaches the token to every request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('aidwise_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;