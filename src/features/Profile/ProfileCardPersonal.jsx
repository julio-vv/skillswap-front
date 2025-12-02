import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Grid, TextField, IconButton, Stack } from '@mui/material';
import { Edit as EditIcon, AccountCircle, Delete, CloudUpload } from '@mui/icons-material';
// Usamos useFormContext para acceder a RHF
import { useFormContext } from 'react-hook-form';

const ProfileCardPersonal = ({ profileData, isEditing }) => {
    // Obtener las funciones de RHF del FormProvider del componente padre
    const { register, formState: { errors }, setValue, watch, trigger } = useFormContext();
    const [previewImage, setPreviewImage] = useState(null);
    
    // Observar el campo media para preview
    const mediaField = watch('media');

    const fallbackText = encodeURIComponent(profileData?.nombre?.charAt(0) || 'U');
    
    // Determinar la URL de la imagen a mostrar
    const getImageUrl = () => {
        if (previewImage) return previewImage;
        return profileData?.media;
    };
    
    const mediaUrl = getImageUrl();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Actualizar el valor en RHF con el archivo y marcar como modificado
            setValue('media', e.target.files, { shouldDirty: true, shouldValidate: true });
        }
    };

    return (
        <Card sx={{ width: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Información Personal</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {/* Imagen de Perfil */}
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                sx={{
                                    width: 80, height: 80, borderRadius: '50%',
                                    backgroundImage: mediaUrl ? `url(${mediaUrl})` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    mr: 2,
                                    border: '2px solid #ccc',
                                    backgroundColor: !mediaUrl ? '#f5f5f5' : 'transparent'
                                }}
                            >
                                {!mediaUrl && (
                                    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <AccountCircle sx={{ fontSize: 50, color: 'text.secondary' }} />
                                    </Box>
                                )}
                            </Box>
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
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body1">**Teléfono:** {profileData?.telefono || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    )}

                    {/* MODO EDICIÓN */}
                    {isEditing && (
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField fullWidth label="Nombre" {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField fullWidth label="Segundo Nombre" {...register('segundo_nombre')} error={!!errors.segundo_nombre} helperText={errors.segundo_nombre?.message} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField fullWidth label="Apellido" {...register('apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Teléfono" {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Email (Solo Lectura)" value={profileData?.email || ''} InputProps={{ readOnly: true }} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Foto de Perfil</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<CloudUpload />}
                                        size="small"
                                    >
                                        Subir Imagen
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        size="small"
                                        disabled
                                    >
                                        Eliminar
                                    </Button>
                                </Stack>
                                {errors.media && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{errors.media.message}</Typography>}
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfileCardPersonal;