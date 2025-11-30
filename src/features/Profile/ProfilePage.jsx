import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, Alert, Stack, CircularProgress, Card, CardContent, Grid, MenuItem } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '../../api/axiosInstance';
import { profileSchema } from '../../schemas/profileSchema';
import Header from '../../components/Header';
import { useAuth } from '../Auth/AuthContext'; // Para la función de Logout

import ProfileCardPersonal from './ProfileCardPersonal';
import ProfileCardHabilidades from './ProfileCardHabilidades';
import ProfileCardReseñas from './ProfileCardReseñas';

const ProfilePage = () => {
    const { logout } = useAuth(); // Para cerrar sesión
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState(null); //<- Estado para almacenar los datos del perfil
    const [allSkills, setAllSkills] = useState([]); // Para habilidades completas
    const [skillTypes, setSkillTypes] = useState([]); // Para Tipos de Habilidad

    // Configurar React Hook Form con el esquema de Perfil
    const methods = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nombre: '', segundo_nombre: '', apellido: '',
            year: 0, telefono: '', habilidades: '', email: '', media: ''
        }
    });

    const {
        handleSubmit,
        reset,
        formState: { isDirty, isSubmitting }
    } = methods;

    // 1. OBTENCIÓN DE DATOS (GET /auth/user/)
    const fetchUserProfile = async () => {
        setIsLoading(true);
        setServerError('');
        try {
            const response = await axiosInstance.get('auth/user/');
            const userData = response.data;

            setProfileData(userData); // Guardar los datos del perfil en el estado

            // Mapeo y ajuste de datos para el formulario
            const defaultValues = {
                nombre: userData.nombre || '',
                segundo_nombre: userData.segundo_nombre || '',
                apellido: userData.apellido || '',
                year: userData.year || 0, // Asegura que sea 0 si es nulo
                telefono: userData.telefono || '',
                habilidades: userData.habilidades.map(h => h.id || h) || [], // Mapea a un array de IDs o queda vacío
                email: userData.email, // Solo lectura
                media: userData.media,
            };

            // Carga los datos obtenidos de la API en el formulario
            reset(defaultValues);

        } catch (error) {
            setServerError('Error al cargar el perfil. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos de habilidades y tipos de habilidad
    const fetchSkillData = async () => {
        try {
            const [skillsResponse, typesResponse] = await Promise.all([
                axiosInstance.get('habilidades/'),
                axiosInstance.get('tipos-habilidad/')
            ]);

            setAllSkills(skillsResponse.data);
            setSkillTypes(typesResponse.data);

        } catch (error) {
            console.error("Error al cargar datos de habilidades:", error);
            // Mostrar error al usuario
        }
    };

    useEffect(() => {
        fetchUserProfile();
        fetchSkillData();
    }, []);

    // 2. ENVÍO DE DATOS (PATCH /auth/user/)
    const onSubmit = async (data) => {
        setServerError('');

        // Crear un objeto FormData ya que la API puede esperar un archivo (media)
        const formData = new FormData();

        // Agregar solo los campos modificados o requeridos por el esquema
        formData.append('nombre', data.nombre);
        formData.append('apellido', data.apellido);
        formData.append('segundo_nombre', data.segundo_nombre || '');

        // Convertir el string de ID de carrera de vuelta a número para la API, o enviar null
        const carreraId = data.carrera === '' ? null : Number(data.carrera);
        formData.append('carrera', carreraId);

        formData.append('year', data.year || 0); // Asume 0 si es null, si la API lo requiere

        // Manejo de la foto de perfil (si se selecciona un archivo)
        // Nota: Si usas <input type="file" />, su valor estará en data.media[0]
        // if (data.media && data.media[0]) {
        //     formData.append('media', data.media[0]); 
        // }

        try {
            await axiosInstance.patch('auth/user/', formData, {
                // Header obligatorio si se envía un archivo
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Recargar los datos para ver la actualización
            fetchUserProfile();
            setIsEditing(false);

        } catch (err) {
            setServerError('Error al guardar el perfil.');
        }
    };

    // 3. Renderizado
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Si no esta cargado y no hay datos, algo falló
    if (!profileData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                {serverError ? (
                    <Alert severity="error">{serverError}</Alert>
                ) : (
                    <Alert severity="warning">No se pudo cargar el perfil.</Alert>
                )}
                <Button onClick={logout} sx={{ mt: 2 }}>Volver a Iniciar Sesión</Button>
            </Container>
        );
    }


    return (
        <Box>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {/* 1. Título y Botón "Editar" */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h1">
                        Mi Perfil
                    </Typography>
                    {/* El botón de editar solo aparece si NO estamos editando */}
                    {!isEditing && (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(true)}
                        >
                            Editar
                        </Button>
                    )}
                </Box>

                {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

                {/*
                1. USAR FormProvider: Esto da acceso a register, errors, etc., a todos los hijos.
                2. USAR Formulario: Se usa el Box como formulario si está en modo Edición.
                */}
                <FormProvider {...methods}>
                    <Box
                        component={isEditing ? 'form' : 'div'}
                        onSubmit={isEditing ? handleSubmit(onSubmit) : undefined}
                    >
                        <Grid container spacing={3}>

                            {/* TARJETA: INFORMACIÓN PERSONAL */}
                            <Grid xs={12} md={6}>
                                <ProfileCardPersonal
                                    profileData={profileData}
                                    isEditing={isEditing}
                                />
                            </Grid>

                            {/* TARJETA: HABILIDADES Y EXPERIENCIA */}
                            <Grid xs={12} md={6}>
                                <ProfileCardHabilidades
                                    profileData={profileData}
                                    isEditing={isEditing}
                                    allSkills={allSkills}
                                    skillTypes={skillTypes}
                                />
                            </Grid>

                            {/* TARJETA: RESEÑAS */}
                            <Grid xs={12}>
                                <ProfileCardReseñas />
                            </Grid>

                            {/* Botones de Guardar/Cancelar solo si está editando */}
                            {isEditing && (
                                <Grid xs={12}>
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!isDirty || isSubmitting}
                                        >
                                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'CONFIRMAR CAMBIOS'}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => { reset(); setIsEditing(false); }}
                                        >
                                            Cancelar
                                        </Button>
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </FormProvider>
            </Container>
        </Box>
    );
};

export default ProfilePage;