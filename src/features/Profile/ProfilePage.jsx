import React, { useState, useEffect } from 'react';
import { Container, Box, Alert, Grid } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { profileSchema } from '../../schemas/profileSchema';
import { useAuth } from '../Auth/AuthContext';
import { useProfileData } from '../../hooks/useProfileData';
import { formatProfileDataForForm } from '../../utils/formatProfileDataForForm';

import ProfileHeader from './components/ProfileHeader';
import ProfileLoading from './components/ProfileLoading';
import ProfileError from './components/ProfileError';
import ProfileView from './components/ProfileView';
import ProfileForm from './components/ProfileForm';
import ProfileCardReseñas from './ProfileCardReseñas';

const ProfilePage = () => {
    const { id: urlUserId } = useParams();
    const { logout, user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    
    // Usar el hook personalizado para manejar datos de perfil
    const {
        profileData,
        isLoading,
        error: profileError,
        allSkills,
        skillTypes,
        updateProfile,
        clearError,
    } = useProfileData(urlUserId);

    // Determinar si estamos viendo nuestro propio perfil
    const isOwnProfile = !urlUserId || (user && String(user.id) === String(urlUserId));

    // Configurar React Hook Form
    const methods = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nombre: '', segundo_nombre: '', apellido: '',
            year: 0, telefono: '', habilidades: [], email: '', media: ''
        }
    });

    const {
        reset,
        formState: { isDirty, isSubmitting }
    } = methods;

    // Cargar datos del perfil en el formulario cuando estén disponibles
    useEffect(() => {
        if (profileData) {
            reset(formatProfileDataForForm(profileData));
        }
    }, [profileData, reset]);

    // Manejar envío del formulario
    const onSubmit = async (data) => {
        clearError();

        // Determinar si hay un archivo nuevo
        const hasFile = data.media && (
            data.media instanceof File || 
            (data.media instanceof FileList && data.media.length > 0)
        );

        const updatedData = await updateProfile(data, hasFile);

        if (updatedData) {
            reset(formatProfileDataForForm(updatedData));
            setIsEditing(false);
        }
    };

    // Renderizado condicional basado en el estado de carga
    if (isLoading) {
        return <ProfileLoading />;
    }

    // Si no hay datos después de cargar, mostrar error
    if (!profileData) {
        return <ProfileError error={profileError} onLogout={logout} />;
    }


    return (
        <Box>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <ProfileHeader 
                    isOwnProfile={isOwnProfile}
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(true)}
                />

                {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}

                <Grid container direction="column" spacing={2} mb={2}>
                    <FormProvider {...methods}>
                        <Box
                            component={isEditing ? 'form' : 'div'}
                            onSubmit={isEditing ? methods.handleSubmit(onSubmit) : undefined}
                        >
                            {isOwnProfile && isEditing ? (
                                <ProfileForm
                                    profileData={profileData}
                                    allSkills={allSkills}
                                    skillTypes={skillTypes}
                                    isDirty={isDirty}
                                    isSubmitting={isSubmitting}
                                    onCancel={() => { reset(); setIsEditing(false); }}
                                />
                            ) : (
                                <ProfileView
                                    profileData={profileData}
                                    allSkills={allSkills}
                                    skillTypes={skillTypes}
                                />
                            )}
                        </Box>
                    </FormProvider>

                    <Grid size={{ xs: 12 }}>
                        <ProfileCardReseñas />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ProfilePage;