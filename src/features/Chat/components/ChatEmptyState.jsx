import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * Estados de carga y vacío del chat
 */
export const ChatEmptyState = ({ state = 'empty' }) => {
    const messages = {
        empty: 'No hay mensajes aún. ¡Envía el primero!',
        noConversation: 'Selecciona una conversación para empezar a chatear',
        error: 'Error al cargar los mensajes'
    };

    if (state === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
        >
            <Typography color="text.secondary">
                {messages[state] || messages.empty}
            </Typography>
        </Box>
    );
};
