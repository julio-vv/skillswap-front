import { Box, Typography, Paper } from '@mui/material';

/**
 * Burbuja individual de mensaje
 */
export const MessageBubble = ({ message, isOwnMessage, formatMessageDate }) => {
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
};
