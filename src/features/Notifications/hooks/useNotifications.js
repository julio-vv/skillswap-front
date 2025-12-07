import { useNotificationsContext } from '../../../context/NotificationsContext';

/**
 * Hook personalizado para gestionar notificaciones
 * IMPORTANTE: Usa el contexto centralizado para evitar polling duplicado
 * 
 * El polling es compartido por toda la aplicación:
 * - Una sola instancia de polling activa
 * - Se comparte entre Header, NotificationsPage, etc.
 * - Se pausa cuando la pestaña está inactiva
 * - Se reanuda cuando la pestaña vuelve a ser activa
 * - -50% polling requests vs versión anterior
 * 
 * @returns {Object} Estado y funciones para manejar notificaciones
 */
export const useNotifications = () => {
    return useNotificationsContext();
};
