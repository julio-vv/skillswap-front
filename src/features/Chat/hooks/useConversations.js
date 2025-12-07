import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { CHAT, AUTH, HABILIDADES, USUARIOS } from '../../../constants/apiEndpoints';

/**
 * Hook para gestionar conversaciones del usuario
 * Asume endpoints:
 * - GET /chat/conversaciones/ : Lista de conversaciones del usuario
 * - POST /chat/conversaciones/ : Crea una conversación
 * - GET /chat/conversaciones/{id}/mensajes/ : Obtiene mensajes de una conversación
 */
export const useConversations = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isInitializedRef = useRef(false);

    /**
     * Obtiene todas las conversaciones del usuario
     * Estructura esperada de cada conversación:
     * {
     *   id: number,
     *   participantes: [user1, user2],
     *   ultimo_mensaje: { contenido, fecha, remitente },
     *   mensajes_no_leidos: number,
     *   actualizado_en: string
     * }
     * @param {boolean} silent - Si es true, no muestra el loading spinner (usado en polling)
     */
    const fetchConversations = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            setError(null);

            // Obtener conversaciones
            const response = await axiosInstance.get(CHAT.conversaciones);
            const conversationsData = response.data;

            // Obtener usuario autenticado para filtrar participantes
            const authResponse = await axiosInstance.get(AUTH.USER);
            const currentUserId = authResponse.data.id;

            // Obtener habilidades para expandir datos
            const skillsResponse = await axiosInstance.get(HABILIDADES);
            const skillsMap = skillsResponse.data.reduce((acc, skill) => {
                acc[skill.id] = skill.nombre_habilidad;
                return acc;
            }, {});

            // Obtener datos de los usuarios de los participantes
            const userIds = new Set();
            conversationsData.forEach(conv => {
                conv.participantes?.forEach(participantId => {
                    if (participantId !== currentUserId) {
                        userIds.add(participantId);
                    }
                });
            });

            const usersMap = {};
            if (userIds.size > 0) {
                // Obtener datos de cada usuario
                for (const userId of userIds) {
                    try {
                        const userResponse = await axiosInstance.get(USUARIOS.detalle(userId));
                        usersMap[userId] = userResponse.data;
                    } catch (err) {
                        console.error(`Error fetching user ${userId}:`, err);
                        usersMap[userId] = { id: userId, nombre: 'Usuario', apellido: 'Desconocido' };
                    }
                }
            }

            // Expandir datos de conversaciones
            const expandedConversations = conversationsData.map(conv => {
                // Encontrar el otro participante (no el usuario actual)
                const otherParticipantId = conv.participantes?.find(p => p !== currentUserId);
                const otherUser = usersMap[otherParticipantId] || { 
                    id: otherParticipantId, 
                    nombre: 'Usuario',
                    apellido: 'Desconocido'
                };

                return {
                    ...conv,
                    otherUser,
                    unreadCount: conv.mensajes_no_leidos || 0,
                    actualizado_en: conv.fecha_actualizacion || conv.actualizado_en
                };
            });

            // Ordenar por última actualización
            expandedConversations.sort((a, b) => 
                new Date(b.actualizado_en) - new Date(a.actualizado_en)
            );

            // Solo actualizar si hay cambios
            setConversations(prevConversations => {
                // Si cambió la cantidad de conversaciones, actualizar
                if (prevConversations.length !== expandedConversations.length) {
                    return expandedConversations;
                }
                // Comparar fecha de actualización de la primera conversación
                const prevFirstUpdate = prevConversations[0]?.actualizado_en;
                const newFirstUpdate = expandedConversations[0]?.actualizado_en;
                if (prevFirstUpdate !== newFirstUpdate) {
                    return expandedConversations;
                }
                // No hay cambios relevantes, mantener estado anterior
                return prevConversations;
            });
        } catch (err) {
            console.error('Error fetching conversations:', err);
            // Si el endpoint no existe (404), no mostrar error al usuario
            if (err.response?.status === 404) {
                setError(null);
                setConversations([]);
            } else {
                setError(err.response?.data?.detail || 'Error al cargar conversaciones');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Crea o obtiene una conversación con un usuario específico
     * Primero verifica si ya existe, si no, la crea
     */
    const getOrCreateConversation = useCallback(async (userId) => {
        try {
            // Primero intentar obtener conversaciones existentes
            const conversationsResponse = await axiosInstance.get(CHAT.conversaciones);
            const existingConversation = conversationsResponse.data.find(conv => {
                // Buscar una conversación donde el otro participante es el userId buscado
                return conv.participantes && conv.participantes.includes(userId);
            });

            if (existingConversation) {
                console.log(`[Chat] Conversación existente encontrada con usuario ${userId}: ${existingConversation.id}`);
                return existingConversation;
            }

            // Si no existe, crear una nueva conversación
            console.log(`[Chat] Creando nueva conversación con usuario ${userId}`);
            const response = await axiosInstance.post(CHAT.conversaciones, {
                participantes: [userId]
            });
            
            // Refrescar la lista de conversaciones
            await fetchConversations();
            
            return response.data;
        } catch (err) {
            console.error('Error creating/getting conversation:', err);
            throw err;
        }
    }, [fetchConversations]);

    /**
     * Marca una conversación como leída
     */
    const markAsRead = useCallback(async (conversationId) => {
        try {
            await axiosInstance.post(CHAT.marcarLeido(conversationId));
            
            // Actualizar localmente
            setConversations(prev => prev.map(conv => 
                conv.id === conversationId 
                    ? { ...conv, unreadCount: 0 }
                    : conv
            ));
        } catch (err) {
            console.error('Error marking conversation as read:', err);
        }
    }, []);

    /**
     * Obtiene el conteo total de mensajes no leídos
     */
    const totalUnread = Array.isArray(conversations) 
        ? conversations.reduce((total, conv) => total + (typeof conv?.unreadCount === 'number' ? conv.unreadCount : 0), 0)
        : 0;

    // Cargar conversaciones al montar (solo una vez)
    useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            fetchConversations();
        }
    }, []);

    // Polling cada 120 segundos; pausa cuando la pestaña está oculta
    useEffect(() => {
        let intervalId = null;

        const startPolling = () => {
            if (intervalId) return;
            intervalId = setInterval(() => {
                // Solo refrescar si la pestaña está visible
                if (!document.hidden) {
                    fetchConversations(true); // true = silent mode
                }
            }, 120000); // 120 segundos
        };

        const stopPolling = () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                // Hacer un fetch inmediato al volver y reanudar
                fetchConversations(true);
                startPolling();
            }
        };

        // Iniciar polling sólo si la pestaña está visible
        if (!document.hidden) {
            startPolling();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            stopPolling();
        };
    }, [fetchConversations]);

    return {
        conversations,
        loading,
        error,
        fetchConversations,
        getOrCreateConversation,
        markAsRead,
        totalUnread
    };
};
