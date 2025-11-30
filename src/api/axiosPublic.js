import axios from 'axios';

// Instancia de Axios para rutas PÚBLICAS (Login y Registro)
const axiosPublic = axios.create({
    baseURL: 'https://api.omarmontanares.com/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// NO se añade ningún interceptor que inyecte el token de autenticación.

export default axiosPublic;