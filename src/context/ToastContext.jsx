import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/**
 * Contexto global para Toast notifications
 * Proporciona una forma centralizada y consistente de mostrar mensajes al usuario
 */
const ToastContext = createContext();

/**
 * Provider del contexto Toast - envuelve la aplicación
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    /**
     * Añadir un toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} severity - 'success' | 'error' | 'warning' | 'info' (default: 'info')
     * @param {number} duration - Duración en ms (default: 4000)
     */
    const showToast = useCallback((message, severity = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, severity }]);

        // Auto-remover después de duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    /**
     * Remover un toast específico
     */
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    /**
     * Limpiar todos los toasts
     */
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast, clearToasts }}>
            {children}
            {/* Renderizar todos los toasts */}
            {toasts.map((toast, index) => (
                <Snackbar
                    key={toast.id}
                    open={true}
                    autoHideDuration={null}
                    onClose={() => removeToast(toast.id)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{
                        bottom: {
                            xs: `calc(16px + ${index * 80}px)`,
                            sm: `calc(24px + ${index * 80}px)`,
                        },
                    }}
                >
                    <Alert
                        onClose={() => removeToast(toast.id)}
                        severity={toast.severity}
                        sx={{ width: '100%' }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>
            ))}
        </ToastContext.Provider>
    );
};

/**
 * Hook para usar el contexto Toast
 * @returns {Object} { showToast, removeToast, clearToasts }
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe ser usado dentro de ToastProvider');
    }
    return context;
};
