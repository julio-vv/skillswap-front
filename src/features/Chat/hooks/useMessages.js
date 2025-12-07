import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';

/**
 * Hook para gestionar mensajes de una conversación específica
 * Asume endpoints:
 * - GET /chat/conversaciones/{id}/mensajes/ : Lista de mensajes de una conversación
 * - POST /chat/conversaciones/{id}/enviar/ : Enviar un nuevo mensaje
 * - PATCH /chat/conversaciones/{id}/mensajes/{messageId}/ : Actualizar un mensaje
 * - DELETE /chat/conversaciones/{id}/mensajes/{messageId}/ : Eliminar un mensaje
 */
export const useMessages = (conversationId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const pollingIntervalRef = useRef(null);

    /**
     * Obtiene los mensajes de la conversación
     * Estructura esperada de cada mensaje:
     * {
     *   id: number,
     *   conversacion: number,
     *   remitente: number | { id, nombre, apellido, ... },
     *   contenido: string,
     *   enviado_en: string (o fecha),
     *   leido: boolean
     * }
     * @param {boolean} silent - Si es true, no muestra el loading spinner (usado en polling)
     */
    const fetchMessages = useCallback(async (silent = false) => {
        if (!conversationId) return;

        try {
            if (!silent) {
                setLoading(true);
            }
            setError(null);

            // Obtener solo los últimos 50 mensajes de la conversación
            const response = await axiosInstance.get(`/chat/conversaciones/${conversationId}/mensajes/`, {
                params: {
                    limit: 50,
                    ordering: '-enviado_en' // Más recientes primero
                }
            });

            // Obtener usuario actual si no lo tenemos
            if (!currentUserId) {
                const authResponse = await axiosInstance.get('/auth/user/');
                setCurrentUserId(authResponse.data.id);
            }

            // Normalizar mensajes: mapear enviado_en a fecha si es necesario
            const normalizedMessages = response.data.map(msg => ({
                ...msg,
                fecha: msg.fecha || msg.enviado_en // Usar enviado_en si fecha no existe
            }));

            // Ordenar mensajes por fecha (más antiguos primero)
            const sortedMessages = [...normalizedMessages].sort((a, b) => {
                const dateA = a.fecha ? new Date(a.fecha) : new Date(0);
                const dateB = b.fecha ? new Date(b.fecha) : new Date(0);
                return dateA - dateB;
            });

            // Solo actualizar si hay cambios (comparar cantidad o IDs)
            setMessages(prevMessages => {
                if (prevMessages.length !== sortedMessages.length) {
                    return sortedMessages;
                }
                // Comparar IDs del último mensaje
                const prevLastId = prevMessages[prevMessages.length - 1]?.id;
                const newLastId = sortedMessages[sortedMessages.length - 1]?.id;
                if (prevLastId !== newLastId) {
                    return sortedMessages;
                }
                // No hay cambios, mantener el estado anterior
                return prevMessages;
            });
        } catch (err) {
            console.error('Error fetching messages:', err);
            // Si el endpoint no existe (404), no mostrar error al usuario
            if (err.response?.status === 404) {
                setError(null);
                setMessages([]);
            } else {
                setError(err.response?.data?.detail || 'Error al cargar mensajes');
            }
        } finally {
            setLoading(false);
        }
    }, [conversationId, currentUserId]);

    /**
     * Envía un nuevo mensaje en la conversación
     */
    const sendMessage = useCallback(async (contenido) => {
        if (!conversationId || !contenido.trim()) return;

        try {
            setSending(true);
            
            const response = await axiosInstance.post(`/chat/conversaciones/${conversationId}/enviar/`, {
                contenido: contenido.trim()
            });

            // Normalizar el mensaje recibido
            const normalizedMessage = {
                ...response.data,
                fecha: response.data.fecha || response.data.enviado_en
            };

            // Agregar el mensaje a la lista local inmediatamente
            setMessages(prev => [...prev, normalizedMessage]);

            return normalizedMessage;
        } catch (err) {
            console.error('Error sending message:', err);
            throw err;
        } finally {
            setSending(false);
        }
    }, [conversationId]);

    /**
     * Marca mensajes como leídos
     */
    const markMessagesAsRead = useCallback(async () => {
        if (!conversationId || !currentUserId) return;

        try {
            // Marcar todos los mensajes no leídos que no sean del usuario actual
            // NOTA: El backend no soporta PATCH en /conversaciones/{id}/mensajes/{messageId}/
            // Por ahora, solo actualizamos localmente
            
            // Actualizar localmente
            setMessages(prev => prev.map(msg => ({
                ...msg,
                leido: (typeof msg.remitente === 'object' ? msg.remitente.id : msg.remitente) === currentUserId 
                    ? msg.leido 
                    : true
            })));
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, [conversationId, currentUserId, messages]);

    /**
     * Elimina un mensaje
     */
    const deleteMessage = useCallback(async (messageId) => {
        try {
            await axiosInstance.delete(`/chat/conversaciones/${conversationId}/mensajes/${messageId}/`);
            
            // Eliminar de la lista local
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            console.error('Error deleting message:', err);
            throw err;
        }
    }, []);

    // Cargar mensajes al montar o cuando cambie el conversationId
    useEffect(() => {
        if (conversationId) {
            fetchMessages();
        } else {
            setMessages([]);
            setLoading(false);
        }
    }, [conversationId, fetchMessages]);

    // Polling cada 10 segundos para nuevos mensajes (modo silencioso)
    useEffect(() => {
        if (!conversationId) return;

        pollingIntervalRef.current = setInterval(() => {
            fetchMessages(true); // true = silent mode (no loading spinner)
        }, 10000); // 10 segundos

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [conversationId, fetchMessages]);

    // Marcar como leído cuando se ven los mensajes
    useEffect(() => {
        if (messages.length > 0 && currentUserId) {
            markMessagesAsRead();
        }
    }, [messages.length, currentUserId]); // Solo cuando cambian los mensajes

    return {
        messages,
        loading,
        error,
        sending,
        currentUserId,
        sendMessage,
        deleteMessage,
        fetchMessages
    };
};
