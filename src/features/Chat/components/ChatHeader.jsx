import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Header del chat con información del usuario
 */
export const ChatHeader = ({ otherUser, onBack }) => {
    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                borderRadius: 0
            }}
        >
            {onBack && (
                <IconButton onClick={onBack} size="small">
                    ←
                </IconButton>
            )}
            {otherUser ? (
                <>
                    <Avatar 
                        src={otherUser?.media || otherUser?.foto_perfil}
                        alt={`${otherUser?.nombre || ''} ${otherUser?.apellido || ''}`}
                    >
                        {otherUser?.nombre?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {otherUser?.nombre} {otherUser?.apellido}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {otherUser?.email}
                        </Typography>
                    </Box>
                </>
            ) : (
                <Typography variant="subtitle1" fontWeight="bold">
                    Conversación
                </Typography>
            )}
        </Paper>
    );
};
