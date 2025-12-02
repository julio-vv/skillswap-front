import axios from 'axios';

// La variable de entorno VITE_API_URL es inyectada por Docker/Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.omarmontanares.com/api/';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para inyectar el Token en peticiones futuras (después del login)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('skillswap_token');
        if (token) {
            // El backend Django/DRF usa el formato 'Token <key>'
            config.headers.Authorization = `Token ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;