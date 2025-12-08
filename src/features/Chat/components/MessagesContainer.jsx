import Box from '@mui/material/Box';
import { DateDivider } from './DateDivider';
import { MessageBubble } from './MessageBubble';

/**
 * Área principal de mensajes agrupados por fecha
 */
export const MessagesContainer = ({ 
    messages, 
    currentUserId, 
    formatMessageDate, 
    containerRef, 
    onScroll,
    endRef
}) => {
    if (messages.length === 0) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
            >
                No hay mensajes
            </Box>
        );
    }

    return (
        <Box 
            ref={containerRef}
            onScroll={onScroll}
            sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}
        >
            {messages.map((group) => (
                <Box key={group.dateKey}>
                    <DateDivider dateKey={group.dateKey} />
                    {group.messages.map((message) => {
                        // Normalizar remitente: puede venir como ID (number) o como objeto completo {id, nombre, ...}
                        // Esto maneja ambos formatos sin duplicación de datos
                        const remitenteId = typeof message.remitente === 'object' 
                            ? message.remitente.id 
                            : message.remitente;
                        const isOwnMessage = remitenteId === currentUserId;

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwnMessage={isOwnMessage}
                                formatMessageDate={formatMessageDate}
                            />
                        );
                    })}
                </Box>
            ))}
            <div ref={endRef} />
        </Box>
    );
};
