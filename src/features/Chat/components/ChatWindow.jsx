import { useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useMessages } from '../hooks/useMessages';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useMessageFormatting } from '../hooks/useMessageFormatting';
import { useMessageInput } from '../hooks/useMessageInput';
import { useToast } from '../../../context/ToastContext';
import { ChatHeader } from './ChatHeader';
import { MessagesContainer } from './MessagesContainer';
import { MessageInput } from './MessageInput';
import { ChatEmptyState } from './ChatEmptyState';

/**
 * Componente principal de la ventana de chat
 * Integra todas las funcionalidades: scroll automático, formateo de mensajes,
 * entrada de texto y renderizado de la interfaz
 */
export const ChatWindow = ({ conversationId, otherUser, onBack }) => {
    const { showToast } = useToast();
    
    // Callback memoizado para mostrar errores desde useMessages (SSE, envío, etc).
    // Se pasa como dependencia al hook para que notifique al usuario en tiempo real.
    const handleError = useCallback((errorMsg) => {
        showToast(errorMsg, 'error', 5000);
    }, [showToast]);
    
    // Orquesta la obtención de mensajes, manejo de SSE/polling y envío.
    // Flujo: carga inicial → SSE en tiempo real → fallback a polling si es necesario.
    const { 
        messages, 
        loading, 
        error, 
        sending, 
        currentUserId, 
        sendMessage 
    } = useMessages(conversationId, handleError);

    const {
        messagesContainerRef,
        messagesEndRef,
        handleScroll,
        scrollToBottom,
        resetScrollState,
        isInitialLoadRef
    } = useAutoScroll(messages, loading);

    const {
        formatMessageDate,
        groupMessagesByDate
    } = useMessageFormatting();

    const {
        messageInput,
        setMessageInput,
        handleSendMessage,
        handleKeyPress,
        handleInputChange
    } = useMessageInput(sendMessage, scrollToBottom);

    // Resetear scroll cuando cambia la conversación
    useEffect(() => {
        resetScrollState();
    }, [conversationId, resetScrollState]);

    // Estados vacíos
    if (!conversationId) {
        return (
            <Box 
                sx={{ 
                    height: '100%', 
                    display: 'flex',
                    bgcolor: 'grey.50'
                }}
            >
                <ChatEmptyState state="noConversation" />
            </Box>
        );
    }

    if (loading && messages.length === 0) {
        return (
            <Box 
                sx={{ 
                    height: '100%', 
                    display: 'flex'
                }}
            >
                <ChatEmptyState state="loading" />
            </Box>
        );
    }

    if (error) {
        return (
            <Box 
                sx={{ 
                    height: '100%', 
                    display: 'flex'
                }}
            >
                <ChatEmptyState state="error" />
            </Box>
        );
    }

    // Preparar datos para renderizar
    const groupedMessages = groupMessagesByDate(messages);

    return (
        <Box 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: 'grey.50'
            }}
        >
            <ChatHeader 
                otherUser={otherUser} 
                onBack={onBack} 
            />

            <MessagesContainer
                messages={groupedMessages}
                currentUserId={currentUserId}
                formatMessageDate={formatMessageDate}
                containerRef={messagesContainerRef}
                onScroll={handleScroll}
                endRef={messagesEndRef}
            />

            <Divider />

            <MessageInput
                value={messageInput}
                onChange={handleInputChange}
                onSubmit={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={sending}
            />
        </Box>
    );
};
