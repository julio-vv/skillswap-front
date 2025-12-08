import React, { createContext, useContext, useCallback, useRef, useEffect, useReducer } from 'react';
import axiosInstance from '../api/axiosInstance';
import { NOTIFICACIONES } from '../constants/apiEndpoints';

/**
 * Context centralizado para notificaciones
 * El polling de solicitudes de match está en useMatchRequests.js
 */
const NotificationsContext = createContext(null);

export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotificationsContext debe usarse dentro de NotificationsProvider');
    }
    return context;
};

// Reducer para notificaciones
const notificationsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_NOTIFICATIONS':
            return {
                ...state,
                notifications: action.payload,
                unreadCount: action.payload.filter(n => !n.leido && n.mostrar).length,
                error: null
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'UPDATE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
                ),
                unreadCount: state.notifications.filter(n => 
                    (n.id === action.payload.id ? !action.payload.updates.leido && action.payload.updates.mostrar : !n.leido && n.mostrar)
                ).length
            };
        default:
            return state;
    }
};

export const NotificationsProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationsReducer, {
        notifications: [],
        unreadCount: 0,
        error: null
    });
    
    const isMountedRef = useRef(true);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                dispatch({ type: 'SET_ERROR', payload: null });
            }
            const response = await axiosInstance.get(NOTIFICACIONES.listar);
            const data = response.data || [];
            if (isMountedRef.current) {
                dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
            }
        } catch (err) {
            if (isMountedRef.current && !silent) {
                dispatch({ type: 'SET_ERROR', payload: 'Error al cargar notificaciones' });
            }
            console.error('Error fetching notifications:', err);
        }
    }, []);

    /**
     * Marca una notificación como leída
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axiosInstance.patch(NOTIFICACIONES.actualizar(notificationId), {
                leido: true
            });
            if (isMountedRef.current) {
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    payload: { id: notificationId, updates: { leido: true } }
                });
            }
        } catch (err) {
            console.error('Error al marcar como leída:', err);
        }
    }, []);

    /**
     * Oculta una notificación
     */
    const hideNotification = useCallback(async (notificationId) => {
        try {
            await axiosInstance.patch(NOTIFICACIONES.actualizar(notificationId), {
                mostrar: false
            });
            if (isMountedRef.current) {
                dispatch({
                    type: 'UPDATE_NOTIFICATION',
                    payload: { id: notificationId, updates: { mostrar: false } }
                });
            }
        } catch (err) {
            console.error('Error al ocultar notificación:', err);
        }
    }, []);

    /**
     * Cleanup
     */
    useEffect(() => {
        // Carga inicial
        fetchNotifications();

        const startPolling = () => {
            if (intervalRef.current) return;
            intervalRef.current = setInterval(() => {
                if (!document.hidden) {
                    fetchNotifications(true);
                }
            }, 120000); // 120s
        };

        const stopPolling = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                fetchNotifications(true);
                startPolling();
            }
        };

        if (!document.hidden) {
            startPolling();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopPolling();
            isMountedRef.current = false;
        };
    }, [fetchNotifications]);

    const value = {
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        error: state.error,
        markAsRead,
        hideNotification,
        fetchNotifications,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};
