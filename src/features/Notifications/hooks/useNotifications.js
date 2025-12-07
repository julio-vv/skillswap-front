import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';

/**
 * Hook personalizado para gestionar notificaciones
 * - Obtiene notificaciones del usuario
 * - Cuenta notificaciones no leídas
 * - Marca notificaciones como leídas u ocultas
 * - Polling automático optimizado (detecta pestaña inactiva)
 * 
 * Optimizaciones:
 * - Detiene polling cuando la pestaña está inactiva
 * - Reanuda polling cuando la pestaña vuelve a ser activa
 * - Prevención de memory leaks
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const pollingIntervalRef = useRef(null);
    const isTabActiveRef = useRef(true);

    /**
     * Obtiene todas las notificaciones del usuario autenticado
     * GET /api/notificaciones/
     */
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notificaciones/');
            const data = response.data;
            
            if (isMountedRef.current) {
                setNotifications(data);
                // Contar solo las notificaciones no leídas y visibles
                setUnreadCount(data.filter(n => !n.leido && n.mostrar).length);
                setError(null);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al cargar notificaciones';
            if (isMountedRef.current) {
                setError(errorMessage);
            }
            console.error('Error fetching notifications:', err);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    /**
     * Marca una notificación como leída
     * PATCH /api/notificaciones/<id>/
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axiosInstance.patch(`/notificaciones/${notificationId}/`, {
                leido: true
            });
            if (isMountedRef.current) {
                await fetchNotifications();
            }
        } catch (err) {
            console.error('Error al marcar como leída:', err);
        }
    }, [fetchNotifications]);

    /**
     * Oculta una notificación (ya no se mostrará en la lista)
     * PATCH /api/notificaciones/<id>/
     */
    const hideNotification = useCallback(async (notificationId) => {
        try {
            await axiosInstance.patch(`/notificaciones/${notificationId}/`, {
                mostrar: false
            });
            if (isMountedRef.current) {
                await fetchNotifications();
            }
        } catch (err) {
            console.error('Error al ocultar notificación:', err);
        }
    }, [fetchNotifications]);

    /**
     * Inicia polling de notificaciones
     * Solo funciona si la pestaña está activa
     */
    const startPolling = useCallback(() => {
        // Cancelar polling anterior si existe
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        // Configurar polling cada 30 segundos solo si la pestaña está activa
        pollingIntervalRef.current = setInterval(() => {
            if (isTabActiveRef.current) {
                fetchNotifications();
            }
        }, 30000);
    }, [fetchNotifications]);

    /**
     * Detecta cuando la pestaña se vuelve activa o inactiva
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            isTabActiveRef.current = !document.hidden;
            
            if (isTabActiveRef.current) {
                // La pestaña se volvió activa, hacer fetch inmediato
                fetchNotifications();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchNotifications]);

    /**
     * Efecto para cargar notificaciones al montar y configurar polling
     * Limpieza correcta para evitar memory leaks
     */
    useEffect(() => {
        isMountedRef.current = true;
        
        // Carga inicial
        fetchNotifications();
        
        // Iniciar polling
        startPolling();
        
        return () => {
            isMountedRef.current = false;
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [fetchNotifications, startPolling]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        hideNotification
    };
};
