import axios from 'axios';

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
        // Si recibimos un 401 (token inválido o expirado), limpiamos la sesión
        if (error.response?.status === 401) {
            // Evitar múltiples redirecciones si ya estamos en login
            if (!window.location.pathname.includes('/login')) {
                console.warn('Token inválido o expirado. Cerrando sesión...');
                localStorage.removeItem('skillswap_token');
                localStorage.removeItem('skillswap_user');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;