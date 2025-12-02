import React from 'react';
import { Card, CardContent, Typography, Box, Button, Grid, TextField, IconButton, Stack } from '@mui/material';
import { Edit as EditIcon, AccountCircle } from '@mui/icons-material';
// Usamos useFormContext para acceder a RHF
import { useFormContext } from 'react-hook-form';

const ProfileCardPersonal = ({ profileData, isEditing }) => {
    // Obtener las funciones de RHF del FormProvider del componente padre
    const { register, formState: { errors } } = useFormContext();

    const fallbackText = encodeURIComponent(profileData?.nombre?.charAt(0) || 'U');
    const mediaUrl = profileData?.media || `https://via.placeholder.com/150?text=${fallbackText}`;

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Información Personal</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {/* Imagen de Perfil */}
                        <Box
                            sx={{
                                width: 80, height: 80, borderRadius: '50%',
                                backgroundImage: `url(${mediaUrl})`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                mr: 2,
                                border: '2px solid #ccc'
                            }}
                        >
                            {!profileData?.media && (
                                <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <AccountCircle sx={{ fontSize: 50, color: 'text.secondary' }} />
                                </Box>
                            )}
                        </Box>
                        <Box>
                            <Typography variant="h5">
                                {profileData?.nombre} {profileData?.segundo_nombre} {profileData?.apellido}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profileData?.email}
                            </Typography>
                        </Box>
                    </Box>

                    {/* MODO LECTURA */}
                    {!isEditing && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid xs={12} sm={6}>
                                <Typography variant="body1">**Teléfono:** {profileData?.telefono || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    )}

                    {/* MODO EDICIÓN */}
                    {isEditing && (
                        <Stack spacing={2}>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Nombre" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Segundo Nombre" {...register('segundo_nombre')} error={!!errors.segundo_nombre} helperText={errors.segundo_nombre?.message} />
                            </Grid>
                            <Grid xs={12} sm={4}>
                                <TextField fullWidth label="Apellido" {...register('apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Teléfono" {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Email (Solo Lectura)" value={profileData?.email || ''} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Cambiar Foto de Perfil</Typography>
                                <input type="file" accept="image/*" {...register('media')} />
                                {errors.media && <Typography color="error" variant="caption">{errors.media.message}</Typography>}
                            </Grid>
                        </Stack>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfileCardPersonal;