import { useEffect } from 'react';
import { Box, Divider } from '@mui/material';
import { useMessages } from '../hooks/useMessages';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useMessageFormatting } from '../hooks/useMessageFormatting';
import { useMessageInput } from '../hooks/useMessageInput';
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
    const { 
        messages, 
        loading, 
        error, 
        sending, 
        currentUserId, 
        sendMessage 
    } = useMessages(conversationId);

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
    }, [conversationId]);

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
