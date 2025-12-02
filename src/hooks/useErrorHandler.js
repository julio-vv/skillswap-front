import { useState, useCallback } from 'react';

/**
 * Hook para manejo centralizado de errores
 * @returns {Object} { error, handleError, clearError }
 */
export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    /**
     * Maneja errores de API de forma consistente
     * @param {Error} err - Error a manejar
     * @param {string} context - Contexto donde ocurrió el error (opcional)
     * @returns {string} Mensaje de error procesado
     */
    const handleError = useCallback((err, context = '') => {
        if (context) {
            console.error(`Error en ${context}:`, err);
        } else {
            console.error('Error:', err);
        }

        let message = 'Ha ocurrido un error inesperado';

        if (err.response) {
            const { status, data } = err.response;
            
            if (status === 401) {
                message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            } else if (status === 403) {
                message = 'No tienes permisos para realizar esta acción.';
            } else if (status === 404) {
                message = 'Recurso no encontrado.';
            } else if (status >= 500) {
                message = 'Error del servidor. Intenta nuevamente más tarde.';
            } else if (data) {
                message = extractErrorMessage(data);
            }
        } else if (err.request) {
            message = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (err.message) {
            message = err.message;
        }

        setError(message);
        return message;
    }, []);

    /**
     * Limpia el error actual
     */
    const clearError = useCallback(() => setError(null), []);

    return { error, handleError, clearError };
};

/**
 * Extrae el mensaje de error de la respuesta del servidor
 * @param {Object|string} data - Datos de error del servidor
 * @returns {string} Mensaje de error formateado
 */
function extractErrorMessage(data) {
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.non_field_errors) return data.non_field_errors.join(' ');
    
    // Buscar el primer campo con error
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
        const value = data[firstKey];
        return Array.isArray(value) ? value.join(' ') : String(value);
    }
    
    return 'Error desconocido';
}
