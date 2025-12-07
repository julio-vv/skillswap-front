import { useState, useEffect, useCallback, useRef } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import axiosInstance from '../../../api/axiosInstance';
import { CHAT, AUTH } from '../../../constants/apiEndpoints';

const resolveApiBaseUrl = () => {
    const base = axiosInstance.defaults.baseURL || import.meta.env.VITE_API_URL || '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    try {
        // Soporta bases relativas (ej: "/api/") y absolutas
        return new URL(normalizedBase, window.location.origin).toString();
    } catch (err) {
        console.warn('[SSE] Base URL inválida, usando origin', err);
        return window.location.origin;
    }
};

const addOrUpdateMessage = (messages, incoming) => {
    const idx = messages.findIndex((m) => m.id === incoming.id);
    if (idx !== -1) {
        const next = [...messages];
        next[idx] = { ...next[idx], ...incoming };
        return next;
    }
    const next = [...messages, incoming];
    return next.sort((a, b) => {
        const dateA = a.fecha ? new Date(a.fecha) : new Date(0);
        const dateB = b.fecha ? new Date(b.fecha) : new Date(0);
        return dateA - dateB;
    });
};

/**
 * Hook para gestionar mensajes de una conversación específica
 * Utiliza SSE (Server-Sent Events) para recibir mensajes nuevos en tiempo real.
 * Endpoints:
 * - GET /chat/conversaciones/{id}/mensajes/ : Historial inicial de mensajes
 * - POST /chat/conversaciones/{id}/enviar/ : Enviar un nuevo mensaje
 * - GET /chat/conversaciones/{id}/stream/?last_id=<n> : SSE stream para nuevos mensajes
 * - DELETE /chat/conversaciones/{id}/mensajes/{messageId}/ : Eliminar un mensaje
 */
export const useMessages = (conversationId, onError) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [useSSE, setUseSSE] = useState(true); // Flag para saber si SSE funciona
    
    // SSE y state tracking
    const eventSourceRef = useRef(null);
    const lastMessageIdRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const isInitialLoadRef = useRef(false);
    const apiBaseUrlRef = useRef(resolveApiBaseUrl());

    /**
     * Obtiene los mensajes iniciales de la conversación
     */
    const fetchInitialMessages = useCallback(async () => {
        if (!conversationId) return;

        try {
            setLoading(true);
            setError(null);

            // Obtener los últimos 50 mensajes de la conversación
            const response = await axiosInstance.get(CHAT.mensajes(conversationId), {
                params: {
                    limit: 50,
                    ordering: '-enviado_en' // Más recientes primero
                }
            });

            // Obtener usuario actual si no lo tenemos
            if (!currentUserId) {
                const authResponse = await axiosInstance.get(AUTH.USER);
                setCurrentUserId(authResponse.data.id);
            }

            // Normalizar mensajes
            const normalizedMessages = response.data.map(msg => ({
                ...msg,
                fecha: msg.fecha || msg.enviado_en
            }));

            // Ordenar mensajes por fecha (más antiguos primero)
            const sortedMessages = [...normalizedMessages].sort((a, b) => {
                const dateA = a.fecha ? new Date(a.fecha) : new Date(0);
                const dateB = b.fecha ? new Date(b.fecha) : new Date(0);
                return dateA - dateB;
            });

            setMessages(sortedMessages);
            
            // Guardar el ID del último mensaje para SSE
            if (sortedMessages.length > 0) {
                lastMessageIdRef.current = sortedMessages[sortedMessages.length - 1].id;
            }
        } catch (err) {
            console.error('Error fetching initial messages:', err);
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
            
            const response = await axiosInstance.post(CHAT.enviarMensaje(conversationId), {
                contenido: contenido.trim()
            });

            // Normalizar el mensaje recibido
            const normalizedMessage = {
                ...response.data,
                fecha: response.data.fecha || response.data.enviado_en
            };

            // Agregar el mensaje a la lista local inmediatamente
            setMessages(prev => addOrUpdateMessage(prev, normalizedMessage));

            return normalizedMessage;
        } catch (err) {
            console.error('Error sending message:', err);
            // Notificar al usuario del error mediante callback
            if (onError) {
                const errorMessage = err.response?.data?.detail || 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
                onError(errorMessage);
            }
            throw err;
        } finally {
            setSending(false);
        }
    }, [conversationId, onError]);

    /**
     * Configura y conecta al stream SSE para recibir mensajes nuevos en tiempo real
     */
    const setupSSE = useCallback(() => {
        if (!conversationId || !isInitialLoadRef.current) {
            return; // Esperar a que se cargue el historial inicial
        }

        // Detener conexión anterior si existe
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        try {
            console.log(`[SSE] Conectando a stream con last_id=${lastMessageIdRef.current}`);

            // Obtener token para autorización en SSE
            const token = localStorage.getItem('skillswap_token');
            if (!token) {
                console.warn('[SSE] No hay token disponible, deshabilitando SSE');
                setUseSSE(false);
                return;
            }

            // Crear nueva conexión SSE con encabezado Authorization
            const streamPath = CHAT.stream(conversationId, lastMessageIdRef.current);
            const streamUrl = new URL(streamPath, apiBaseUrlRef.current).toString();

            eventSourceRef.current = new EventSourcePolyfill(streamUrl, {
                headers: { Authorization: `Token ${token}` },
                withCredentials: true,
            });

            eventSourceRef.current.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    console.log(`[SSE] Nuevo mensaje recibido (id=${msg.id}):`, msg.contenido.substring(0, 50));
                    
                    // Normalizar mensaje
                    const normalizedMsg = {
                        ...msg,
                        fecha: msg.fecha || msg.enviado_en
                    };

                    // Agregar mensaje a la lista
                    setMessages(prev => addOrUpdateMessage(prev, normalizedMsg));
                    
                    // Actualizar last_id para próxima reconexión
                    lastMessageIdRef.current = msg.id;
                } catch (err) {
                    console.error('[SSE] Error parsing message:', err);
                }
            };

            eventSourceRef.current.onerror = (err) => {
                console.warn('[SSE] Connection error, cerrando stream');
                eventSourceRef.current.close();
                
                // Si SSE falla múltiples veces, caer a polling
                setUseSSE(false);
                console.log('[SSE] Fallback a polling automático');
            };

        } catch (err) {
            console.error('[SSE] Error setting up EventSource:', err);
        }
    }, [conversationId]);

    /**
     * Polling fallback para cuando SSE no esté disponible
     */
    const setupPollingFallback = useCallback(() => {
        if (!conversationId) return;

        console.log('[POLLING] Iniciando polling cada 30s como fallback de SSE');
        
        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await axiosInstance.get(CHAT.mensajes(conversationId), {
                    params: {
                        limit: 50,
                        ordering: '-enviado_en'
                    }
                });

                const normalizedMessages = response.data.map(msg => ({
                    ...msg,
                    fecha: msg.fecha || msg.enviado_en
                }));

                const sortedMessages = [...normalizedMessages].sort((a, b) => {
                    const dateA = a.fecha ? new Date(a.fecha) : new Date(0);
                    const dateB = b.fecha ? new Date(b.fecha) : new Date(0);
                    return dateA - dateB;
                });

                // Combinar mensajes nuevos evitando duplicados
                setMessages(prevMessages => {
                    let merged = prevMessages;
                    sortedMessages.forEach((msg) => {
                        merged = addOrUpdateMessage(merged, msg);
                    });
                    return merged;
                });
            } catch (err) {
                console.error('[POLLING] Error al obtener mensajes:', err);
            }
        }, 30000);
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
            await axiosInstance.delete(CHAT.eliminarMensaje(conversationId, messageId));
            
            // Eliminar de la lista local
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            console.error('Error deleting message:', err);
            throw err;
        }
    }, []);

    // Cargar mensajes iniciales al montar o cuando cambie la conversación
    useEffect(() => {
        lastMessageIdRef.current = 0;
        isInitialLoadRef.current = false;
        setUseSSE(true); // Reset SSE flag al cambiar conversación
        
        if (conversationId) {
            fetchInitialMessages().then(() => {
                isInitialLoadRef.current = true;
                // Después de cargar el historial, intentar SSE
                setupSSE();
            });
        } else {
            setMessages([]);
            setLoading(false);
        }

        return () => {
            // Limpiar conexiones al desmontar
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [conversationId, fetchInitialMessages, setupSSE]);

    // Fallback a polling si SSE falla
    useEffect(() => {
        if (!useSSE && conversationId) {
            setupPollingFallback();
            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [useSSE, conversationId, setupPollingFallback]);

    // Marcar como leído cuando se ven los mensajes
    useEffect(() => {
        if (messages.length > 0 && currentUserId) {
            markMessagesAsRead();
        }
    }, [messages.length, currentUserId]);

    return {
        messages,
        loading,
        error,
        sending,
        currentUserId,
        sendMessage,
        deleteMessage,
        fetchInitialMessages
    };
};
