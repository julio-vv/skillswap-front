import React, { useState } from 'react';
// Librerías
import { Container, Typography, Box, Button, TextField, Alert, Stack, CircularProgress, MenuItem, IconButton, InputAdornment, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
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
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);

    // 1. Configurar React Hook Form con Zod Resolver
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
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

    // Observar valores de los campos para validaciones en tiempo real
    const password1Value = watch('password1', '');
    const emailValue = watch('email', '');

    // Validación de requisitos de contraseña
    const passwordRequirements = {
        minLength: password1Value.length >= 8,
        hasNumber: /\d/.test(password1Value),
        hasLetter: /[a-zA-Z]/.test(password1Value),
        notSimilarToEmail: emailValue && password1Value ? 
            !password1Value.toLowerCase().includes(emailValue.split('@')[0].toLowerCase()) &&
            !emailValue.toLowerCase().includes(password1Value.toLowerCase()) : true
    };

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
                    setError(`Contraseña: ${apiErrors.password1.join(' ')}`);
                } else if (apiErrors.password2) {
                    setError(`Confirmación de contraseña: ${apiErrors.password2[0]}`);
                } else if (apiErrors.non_field_errors) {
                    setError(`${apiErrors.non_field_errors.join(' ')}`);
                } else if (Object.keys(apiErrors).length > 0) {
                    const firstKey = Object.keys(apiErrors)[0];
                    const fieldName = {
                        'nombre': 'Nombre',
                        'apellido': 'Apellido',
                        'segundo_nombre': 'Segundo Nombre'
                    }[firstKey] || firstKey;
                    setError(`${fieldName}: ${Array.isArray(apiErrors[firstKey]) ? apiErrors[firstKey].join(' ') : apiErrors[firstKey]}`);
                } else {
                    setError('Ocurrió un error al registrar. Inténtalo de nuevo.');
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

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
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
                        required 
                        fullWidth 
                        margin="normal" 
                        label="Contraseña" 
                        type={showPassword1 ? "text" : "password"} 
                        autoComplete="new-password" 
                        {...register('password1')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword1(!showPassword1)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!errors.password1} 
                        helperText={errors.password1?.message}
                    />
                    
                    {/* Indicadores de requisitos de contraseña */}
                    {password1Value && (<Box sx={{ mt: 1, mb: 1, width: '100%', overflow: 'hidden' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                Requisitos de contraseña:
                            </Typography>
                            <Stack spacing={0.5} sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.minLength ? 
                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <Cancel sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.minLength ? 'success.main' : 'text.secondary'} noWrap>
                                        Mínimo 8 caracteres
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.hasNumber ? 
                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <Cancel sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.hasNumber ? 'success.main' : 'text.secondary'} noWrap>
                                        Al menos un número
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.hasLetter ? 
                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <Cancel sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.hasLetter ? 'success.main' : 'text.secondary'} noWrap>
                                        Al menos una letra
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.notSimilarToEmail ? 
                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <Cancel sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.notSimilarToEmail ? 'success.main' : 'text.secondary'} sx={{ wordBreak: 'break-word' }}>No debe ser similar al email
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                    <TextField
                        required 
                        fullWidth 
                        margin="normal" 
                        label="Confirmar Contraseña" 
                        type={showPassword2 ? "text" : "password"} 
                        autoComplete="new-password" 
                        {...register('password2')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword2(!showPassword2)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!errors.password2} 
                        helperText={errors.password2?.message}
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
