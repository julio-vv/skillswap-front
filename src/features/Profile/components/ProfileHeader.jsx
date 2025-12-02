import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

/**
 * Componente del encabezado del perfil
 * Muestra el título y el botón de editar si corresponde
 */
const ProfileHeader = ({ isOwnProfile, isEditing, onEdit }) => {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
                {isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario'}
            </Typography>
            
            {isOwnProfile && !isEditing && (
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                >
                    Editar
                </Button>
            )}
        </Box>
    );
};

export default ProfileHeader;
