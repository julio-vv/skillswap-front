import axios from 'axios';

// La variable de entorno VITE_API_URL es inyectada por Docker/Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.omarmontanares.com/api/';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para inyectar el Token en peticiones futuras (después del login)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('skillswap_token');
        if (token) {
            // El backend Django/DRF usa el formato 'Token <key>'
            config.headers.Authorization = `Token ${token}`; 
        }
        // Si enviamos FormData, dejar que el navegador establezca el boundary automáticamente
        if (config.data instanceof FormData) {
            if (config.headers) {
                if (config.headers['Content-Type']) delete config.headers['Content-Type'];
                if (config.headers['content-type']) delete config.headers['content-type'];
            }
            try {
                const ct = (config.headers && (config.headers['Content-Type'] || config.headers['content-type'])) || '(unset)';
                console.log('[Axios] Enviando FormData', config.method?.toUpperCase(), config.url, 'Content-Type:', ct);
            } catch {}
        } else {
            // Para JSON, axios establecerá application/json por defecto si no se especifica
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores (especialmente 401 Unauthorized)
axiosInstance.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa, simplemente la devolvemos
        return response;
    },
    (error) => {
        // Si recibimos un 401 (token inválido o expirado), limpiamos la sesión
        if (error.response && error.response.status === 401) {
            console.warn('Token inválido o expirado. Cerrando sesión...');
            localStorage.removeItem('skillswap_token');
            localStorage.removeItem('skillswap_user');
            // Redirigir al login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;