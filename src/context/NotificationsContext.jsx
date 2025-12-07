import React, { createContext, useContext, useCallback, useRef, useEffect, useReducer } from 'react';
import axiosInstance from '../api/axiosInstance';
import { NOTIFICACIONES } from '../constants/apiEndpoints';

/**
 * Context centralizado para notificaciones
 * SIMPLIFICADO: Solo maneja el estado, sin polling complicado
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
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const value = {
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        error: state.error,
        markAsRead,
        hideNotification,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};
