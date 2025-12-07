import { Box, Paper, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/**
 * Área de entrada de mensajes
 */
export const MessageInput = ({ 
    value, 
    onChange, 
    onSubmit, 
    onKeyPress, 
    disabled 
}) => {
    return (
        <Paper 
            component="form" 
            onSubmit={onSubmit}
            sx={{ 
                p: 2, 
                display: 'flex', 
                gap: 1,
                borderRadius: 0
            }}
            elevation={3}
        >
            <TextField
                id="message-input"
                name="message-input"
                fullWidth
                multiline
                maxRows={4}
                placeholder="Escribe un mensaje..."
                value={value}
                onChange={onChange}
                onKeyPress={onKeyPress}
                disabled={disabled}
                variant="outlined"
                size="small"
            />
            <IconButton 
                color="primary" 
                type="submit"
                disabled={!value.trim() || disabled}
                sx={{ alignSelf: 'flex-end' }}
            >
                {disabled ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
        </Paper>
    );
};
