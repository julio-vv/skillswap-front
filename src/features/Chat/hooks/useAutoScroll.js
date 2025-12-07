import { useEffect, useRef } from 'react';

const SCROLL_BOTTOM_THRESHOLD = 50; // px

/**
 * Hook personalizado para manejar el auto-scroll inteligente en el chat
 * - Scroll inicial al final cuando carga la conversación
 * - Scroll automático cuando llegan nuevos mensajes (solo si usuario está al final)
 * - Restaura scroll si fue interrumpido por polling
 */
export const useAutoScroll = (messages, loading) => {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // Refs para controlar el comportamiento del scroll
    const firstRenderRef = useRef(true);
    const previousMessageCountRef = useRef(0);
    const shouldMaintainScrollRef = useRef(false);
    const lastScrollTopRef = useRef(0);
    const isUserAtBottomRef = useRef(true);
    const isInitialLoadRef = useRef(true);

    /**
     * Detecta si el usuario está viendo el final de la conversación
     */
    const checkIfUserAtBottom = () => {
        if (!messagesContainerRef.current) return false;
        
        const { scrollHeight, clientHeight, scrollTop } = messagesContainerRef.current;
        return scrollHeight - (scrollTop + clientHeight) < SCROLL_BOTTOM_THRESHOLD;
    };

    /**
     * Desplaza el contenedor al final
     */
    const scrollToBottom = () => {
        if (!messagesContainerRef.current) return;

        setTimeout(() => {
            if (messagesContainerRef.current) {
                const scrollHeight = messagesContainerRef.current.scrollHeight;
                messagesContainerRef.current.scrollTop = scrollHeight;
                lastScrollTopRef.current = scrollHeight;
                isUserAtBottomRef.current = true;
            }
        }, 0);
    };

    /**
     * Manejador para detectar cuando el usuario hace scroll
     */
    const handleScroll = () => {
        isUserAtBottomRef.current = checkIfUserAtBottom();
    };

    /**
     * Resetea los refs cuando cambia la conversación
     */
    const resetScrollState = () => {
        isInitialLoadRef.current = true;
        firstRenderRef.current = true;
        previousMessageCountRef.current = 0;
        shouldMaintainScrollRef.current = false;
        lastScrollTopRef.current = 0;
        isUserAtBottomRef.current = true;
    };

    // Scroll inicial: ejecutar SOLO en el primer render con datos
    useEffect(() => {
        if (firstRenderRef.current && messages.length > 0 && !loading && messagesContainerRef.current) {
            firstRenderRef.current = false;
            shouldMaintainScrollRef.current = true;
            scrollToBottom();
        }
    }, [messages.length, loading]);

    // Restaurar scroll si fue reseteado por polling (ejecutar con frecuencia pero de manera controlada)
    useEffect(() => {
        const handleScrollRestore = () => {
            if (shouldMaintainScrollRef.current && messagesContainerRef.current && lastScrollTopRef.current > 0) {
                if (messagesContainerRef.current.scrollTop === 0 && messagesContainerRef.current.scrollHeight > 100) {
                    messagesContainerRef.current.scrollTop = lastScrollTopRef.current;
                } else if (messagesContainerRef.current.scrollTop !== lastScrollTopRef.current) {
                    lastScrollTopRef.current = messagesContainerRef.current.scrollTop;
                }
            }
        };
        
        // Ejecutar al cambiar mensajes
        handleScrollRestore();
    }, [messages.length]);

    // Auto-scroll cuando llegan nuevos mensajes (solo si usuario está al final)
    useEffect(() => {
        if (!isInitialLoadRef.current && messages.length > previousMessageCountRef.current) {
            if (isUserAtBottomRef.current || previousMessageCountRef.current === 0) {
                scrollToBottom();
            }
        }
        previousMessageCountRef.current = messages.length;
    }, [messages.length]);

    return {
        messagesContainerRef,
        messagesEndRef,
        handleScroll,
        scrollToBottom,
        resetScrollState,
        isInitialLoadRef
    };
};
