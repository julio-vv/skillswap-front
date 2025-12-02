import axios from 'axios';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../constants/errorMessages';

// La variable de entorno VITE_API_URL es inyectada por Docker/Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.omarmontanares.com/api/';

/**
 * Instancia de Axios para rutas públicas (Login y Registro)
 * No incluye interceptores de autenticación
 */
const axiosPublic = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 segundos
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Response interceptor para manejo consistente de errores
axiosPublic.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log de errores para debugging
        if (error.response) {
            console.error('Error de respuesta:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Error de red:', ERROR_MESSAGES.network);
        } else {
            console.error('Error:', error.message || ERROR_MESSAGES.unexpected);
        }

        // Podríamos mapear y adjuntar un mensaje amigable en error._friendlyMessage
        try {
            const friendly = error.response?.data ? extractApiErrorMessage(error.response.data) : null;
            if (friendly) error._friendlyMessage = friendly;
        } catch {}

        return Promise.reject(error);
    }
);

export default axiosPublic;