import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Separador de fecha entre grupos de mensajes
 */
export const DateDivider = ({ dateKey }) => {
    return (
        <Box 
            display="flex" 
            justifyContent="center" 
            my={2}
        >
            <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2
                }}
            >
                {dateKey}
            </Typography>
        </Box>
    );
};
