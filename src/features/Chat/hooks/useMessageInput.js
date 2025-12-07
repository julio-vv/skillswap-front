import { useState } from 'react';

/**
 * Hook para manejar la lógica de envío y entrada de mensajes
 */
export const useMessageInput = (sendMessageFn, onMessageSent) => {
    const [messageInput, setMessageInput] = useState('');

    /**
     * Maneja el envío de mensajes
     */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!messageInput.trim()) return;

        try {
            await sendMessageFn(messageInput);
            setMessageInput('');
            onMessageSent?.();
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    /**
     * Maneja el evento de tecla (Enter para enviar)
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    /**
     * Actualiza el texto del input
     */
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
    };

    return {
        messageInput,
        setMessageInput,
        handleSendMessage,
        handleKeyPress,
        handleInputChange
    };
};
