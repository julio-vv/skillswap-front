import axios from 'axios';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../constants/errorMessages';
import { ROUTES } from '../constants/routePaths';

// La variable de entorno VITE_API_URL es inyectada por Docker/Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.omarmontanares.com/api/';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 segundos
    headers: {
        'Accept': 'application/json',
    }
});

// Interceptor para inyectar el Token en peticiones futuras (después del login)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('skillswap_token');
        if (token) {
            // El backend Django/DRF usa el formato 'Token <key>'
            config.headers.Authorization = `Token ${token}`; 
        }

        // Manejar FormData correctamente: dejar que el navegador establezca el boundary
        if (config.data instanceof FormData) {
            // Eliminar Content-Type para que el navegador lo establezca con el boundary correcto
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ignorar errores de cancelación (AbortController)
        // Estos son normales cuando el usuario navega rápidamente o el componente se desmonta
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (isCanceled) {
            return Promise.reject(error);
        }

        const status = error.response?.status;

        // Si recibimos un 401 (token inválido o expirado), limpiamos la sesión
        if (status === 401) {
            if (!window.location.pathname.includes(ROUTES.LOGIN)) {
                console.warn('Token inválido o expirado. Cerrando sesión...');
                localStorage.removeItem('skillswap_token');
                localStorage.removeItem('skillswap_user');
                window.location.href = ROUTES.LOGIN;
            }
        }

        // Adjuntar mensaje amigable si viene del backend
        try {
            const friendly = error.response?.data ? extractApiErrorMessage(error.response.data) : null;
            if (friendly) error._friendlyMessage = friendly;
        } catch {}

        // Logs consistentes (solo para errores reales, no cancelaciones)
        if (error.response) {
            console.error('API error:', status, error._friendlyMessage || ERROR_MESSAGES.unexpected);
        } else if (error.request) {
            console.error('Network error:', ERROR_MESSAGES.network);
        } else {
            console.error('Error:', error.message || ERROR_MESSAGES.unexpected);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;