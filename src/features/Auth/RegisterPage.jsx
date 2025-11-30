import React, { useState } from 'react';
// Librerías
import { Container, Typography, Box, Button, TextField, Alert, Stack, CircularProgress, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Necesario para usar Zod con RHF
// import axiosInstance from '../../api/axiosInstance';
import axiosPublic from '../../api/axiosPublic';
import { registerSchema } from '../../schemas/authSchema'; // Importamos el esquema Zod

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. Configurar React Hook Form con Zod Resolver
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            // Inicializa los valores para evitar advertencias de React
            email: '',
            password1: '',
            password2: '',
            nombre: '',
            segundo_nombre: '',
            apellido: '',
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            // Llama al endpoint POST /auth/registration/
            const response = await axiosPublic.post('auth/registration/', {
                email: data.email,
                password1: data.password1,
                password2: data.password2,
                nombre: data.nombre,
                segundo_nombre: data.segundo_nombre || null, // Envía null si está vacío
                apellido: data.apellido,
            });

            // Si el registro es exitoso, la API devuelve el token
            const token = response.data.key;

            // Guardar el token (se usará en el futuro para iniciar sesión automáticamente)
            localStorage.setItem('skillswap_token', token);

            // Redirigir al usuario, quizás a una página de bienvenida o al perfil.
            navigate('/home', { state: { registered: true } });

        } catch (err) {
            setLoading(false);
            // Manejo de errores específicos de DRF (ej. email ya en uso)
            if (err.response && err.response.data) {
                const apiErrors = err.response.data;

                console.error('API Validation Errors:', apiErrors);

                let errorMessage = 'Error al registrar: ';

                if (apiErrors.email) {
                    setError(`Email: ${apiErrors.email[0]}`);
                } else if (apiErrors.password1) {
                    setError(`Contraseña: ${apiErrors.password1[0]}`);
                    // Si hay errores que no son de campo (ej. contraseñas no coinciden en el backend,
                    // o errores de validación a nivel de objeto)
                } else if (apiErrors.non_field_errors) {
                    errorMessage = `Error: ${apiErrors.non_field_errors.join(' ')}`;
                }
                // Para cualquier otro error de campo (nombre, apellido, etc.)
                else if (Object.keys(apiErrors).length > 0) {
                    const firstKey = Object.keys(apiErrors)[0];
                    errorMessage = `Error en ${firstKey}: ${apiErrors[firstKey].join(' ')}`;
                } else {
                    errorMessage = 'Ocurrió un error al registrar. Inténtalo de nuevo.';
                }
            } else {
                setError('Error de red o servidor.');
            }
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Regístrate en Skill Swap
                </Typography>

                {error && <Alert severity="error" sx={{ width: '100%', mt: 2, mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    {/* Sección 1: Datos Personales */}
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Información Personal
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            required fullWidth label="Nombre" {...register('nombre')}
                            error={!!errors.nombre} helperText={errors.nombre?.message}
                        />
                        <TextField
                            fullWidth label="Segundo Nombre (Opcional)" {...register('segundo_nombre')}
                            error={!!errors.segundo_nombre} helperText={errors.segundo_nombre?.message}
                        />
                    </Stack>
                    <TextField
                        required fullWidth margin="normal" label="Apellido" {...register('apellido')}
                        error={!!errors.apellido} helperText={errors.apellido?.message}
                    />

                    {/* Sección 2: Datos de Estudio */}

                    {/* Sección 3: Credenciales */}
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                        Credenciales
                    </Typography>
                    <TextField
                        required fullWidth margin="normal" label="Email" autoComplete="email" {...register('email')}
                        error={!!errors.email} helperText={errors.email?.message}
                    />
                    <TextField
                        required fullWidth margin="normal" label="Contraseña" type="password" autoComplete="new-password" {...register('password1')}
                        error={!!errors.password1} helperText={errors.password1?.message}
                    />
                    <TextField
                        required fullWidth margin="normal" label="Confirmar Contraseña" type="password" autoComplete="new-password" {...register('password2')}
                        error={!!errors.password2} helperText={errors.password2?.message}
                    />

                    {/* Botones */}
                    <Button
                        type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1 }} disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'REGISTRARSE'}
                    </Button>

                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <Button color="secondary" onClick={() => navigate('/login')} fullWidth>
                            ¿Ya tienes cuenta? Inicia sesión
                        </Button>
                        <Button variant="text" onClick={() => navigate('/')} fullWidth>
                            Volver a Inicio
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;