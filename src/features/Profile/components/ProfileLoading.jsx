import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Componente de carga para ProfilePage
 */
const ProfileLoading = () => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default ProfileLoading;
