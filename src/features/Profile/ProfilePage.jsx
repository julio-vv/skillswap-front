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
    const { logout, user } = useAuth(); // Para cerrar sesión. `user` contiene el id si tu API requiere `usuarios/{id}/`
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
            year: 0, telefono: '', habilidades: [], email: '', media: ''
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
                habilidades: userData.habilidades ? userData.habilidades.map(h => h.id) : [], // Mapea a un array de IDs o queda vacío
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
        // `data.habilidades` ya es un array de IDs gracias al Controller
        const payload = { ...data };

        try {
            // Si hay una nueva imagen (un File o FileList), enviamos como FormData (multipart/form-data)
            const mediaIsFile = payload.media && (typeof File !== 'undefined') && (
                payload.media instanceof File || payload.media instanceof FileList
            );

            if (mediaIsFile) {
                const formData = new FormData();

                Object.keys(payload).forEach(key => {
                    if (key === 'habilidades') {
                        // Enviar múltiples entradas con la misma clave es compatible con DRF
                        payload[key].forEach(id => formData.append('habilidades', id));
                    } else if (key === 'media') {
                        // `media` puede ser FileList o File
                        const file = payload.media instanceof FileList ? payload.media[0] : payload.media;
                        if (file) formData.append('media', file);
                    } else {
                        formData.append(key, payload[key]);
                    }
                });

                // Determinar endpoint: preferimos `usuarios/{id}/` si tenemos el id
                // (puede venir del contexto `user` o de `profileData` cargada previamente).
                const idForEndpoint = user?.id ?? profileData?.id;
                const endpoint = idForEndpoint ? `usuarios/${idForEndpoint}/` : 'usuarios/me/';
                const response = await axiosInstance.patch(endpoint, formData);

                setProfileData(response.data);
                const resetValues = {
                    nombre: response.data.nombre || '',
                    segundo_nombre: response.data.segundo_nombre || '',
                    apellido: response.data.apellido || '',
                    year: response.data.year || 0,
                    telefono: response.data.telefono || '',
                    habilidades: response.data.habilidades ? response.data.habilidades.map(h => h.id) : [],
                    email: response.data.email || '',
                    media: response.data.media || '',
                };

                methods.reset(resetValues);
                setIsEditing(false);
                return; // Ya hicimos la petición con FormData
            }

            // Envío JSON cuando no hay fichero. Asegurarse de no enviar `media` si es una URL/string.
            if (payload.media && typeof payload.media === 'string') {
                delete payload.media;
            }

            const idForEndpoint = user?.id ?? profileData?.id;
            const endpoint = idForEndpoint ? `usuarios/${idForEndpoint}/` : 'usuarios/me/';
            const response = await axiosInstance.patch(endpoint, payload);

            setProfileData(response.data);

            const resetValues = {
                nombre: response.data.nombre || '',
                segundo_nombre: response.data.segundo_nombre || '',
                apellido: response.data.apellido || '',
                year: response.data.year || 0,
                telefono: response.data.telefono || '',
                habilidades: response.data.habilidades ? response.data.habilidades.map(h => h.id) : [],
                email: response.data.email || '',
                media: response.data.media || '',
            };

            methods.reset(resetValues);
            setIsEditing(false);

        } catch (error) {
            // Mostrar información detallada del error si la API la proporciona
            console.error('Error al guardar perfil:', error);
            if (error.response && error.response.data) {
                console.error('Detalles del servidor:', error.response.data);
                // Mostrar mensaje específico si viene del servidor
                const serverMsg = typeof error.response.data === 'string' ? error.response.data : (error.response.data.detail || JSON.stringify(error.response.data));
                setServerError(`Error al guardar el perfil: ${serverMsg}`);
            } else {
                setServerError('Error al guardar el perfil. Intenta de nuevo.');
            }
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
                <Grid container direction="column" spacing={2} mb={2}>
                    <FormProvider {...methods}>
                        {/* Box que contiene datos personales y habilidades */}
                        <Box
                            component={isEditing ? 'form' : 'div'}
                            onSubmit={isEditing ? methods.handleSubmit(onSubmit) : undefined}
                        >
                            <Grid container spacing={2}>

                                {/* TARJETA: INFORMACIÓN PERSONAL */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <ProfileCardPersonal
                                        profileData={profileData}
                                        isEditing={isEditing}
                                    />
                                </Grid>

                                {/* TARJETA: HABILIDADES Y EXPERIENCIA */}
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <ProfileCardHabilidades
                                        profileData={profileData}
                                        isEditing={isEditing}
                                        allSkills={allSkills}
                                        skillTypes={skillTypes}
                                    />
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

                    {/* TARJETA: RESEÑAS */}
                    <Grid size={{ xs: 12 }}>
                        <ProfileCardReseñas />
                    </Grid>
                </Grid>



            </Container>
        </Box>
    );
};

export default ProfilePage;