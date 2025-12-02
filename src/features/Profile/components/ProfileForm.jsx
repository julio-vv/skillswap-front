import React from 'react';
import { Grid, Stack, Button, CircularProgress } from '@mui/material';
import ProfileCardPersonal from '../ProfileCardPersonal';
import ProfileCardHabilidades from '../ProfileCardHabilidades';

/**
 * Componente que muestra las tarjetas de perfil en modo edición
 * Incluye los botones de guardar y cancelar
 */
const ProfileForm = ({ 
    profileData, 
    allSkills, 
    skillTypes, 
    isDirty, 
    isSubmitting, 
    onCancel 
}) => {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <ProfileCardPersonal
                    profileData={profileData}
                    isEditing={true}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <ProfileCardHabilidades
                    profileData={profileData}
                    isEditing={true}
                    allSkills={allSkills}
                    skillTypes={skillTypes}
                />
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!isDirty || isSubmitting}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'CONFIRMAR CAMBIOS'
                        )}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default ProfileForm;
