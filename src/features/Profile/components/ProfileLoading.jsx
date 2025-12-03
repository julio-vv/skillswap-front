import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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
