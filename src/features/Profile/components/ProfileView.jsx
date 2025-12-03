import React from 'react';
import Grid from '@mui/material/Grid';
import ProfileCardPersonal from '../ProfileCardPersonal';
import ProfileCardHabilidades from '../ProfileCardHabilidades';

/**
 * Componente que muestra las tarjetas de perfil en modo lectura
 */
const ProfileView = ({ profileData, allSkills, skillTypes }) => {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <ProfileCardPersonal
                    profileData={profileData}
                    isEditing={false}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
                <ProfileCardHabilidades
                    profileData={profileData}
                    isEditing={false}
                    allSkills={allSkills}
                    skillTypes={skillTypes}
                />
            </Grid>
        </Grid>
    );
};

export default ProfileView;
