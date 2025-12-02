import { useState, useCallback } from 'react';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../constants/errorMessages';

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

        let message = ERROR_MESSAGES.unexpected;

        if (err.response) {
            const { status, data } = err.response;
            
            if (status === 401) {
                message = ERROR_MESSAGES.sessionExpired;
            } else if (status === 403) {
                message = ERROR_MESSAGES.forbidden;
            } else if (status === 404) {
                message = ERROR_MESSAGES.notFound;
            } else if (status >= 500) {
                message = ERROR_MESSAGES.server;
            } else if (data) {
                message = extractApiErrorMessage(data);
            }
        } else if (err.request) {
            message = ERROR_MESSAGES.network;
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

// La extracción de mensajes se centraliza en `src/constants/errorMessages.js`
