import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

/**
 * Burbuja individual de mensaje
 */
export const MessageBubble = memo(({ message, isOwnMessage, formatMessageDate }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                mb: 1
            }}
        >
            <Paper
                elevation={1}
                sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                    color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                    borderBottomRightRadius: isOwnMessage ? 4 : 16,
                    borderBottomLeftRadius: isOwnMessage ? 16 : 4
                }}
            >
                <Typography 
                    variant="body1" 
                    sx={{ 
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {message.contenido}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        opacity: 0.8
                    }}
                >
                    {formatMessageDate(message.fecha)}
                </Typography>
            </Paper>
        </Box>
    );
}, (prevProps, nextProps) => {
    // Retornar true si son iguales (no re-renderizar)
    return prevProps.message.id === nextProps.message.id &&
           prevProps.isOwnMessage === nextProps.isOwnMessage &&
           prevProps.message.contenido === nextProps.message.contenido &&
           prevProps.message.fecha === nextProps.message.fecha;
});

MessageBubble.displayName = 'MessageBubble';
