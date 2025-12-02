import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress, Stack, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
// import axiosInstance from '../../api/axiosInstance';
import axiosPublic from '../../api/axiosPublic';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        
        try {
            // Llama al endpoint POST /auth/login/
            const response = await axiosPublic.post('auth/login/', {
                email: data.email,
                password: data.password,
            });

            // La API devuelve { "key": "<token>" }
            const token = response.data.key;
            
            // 1. Guardar el token para futuras peticiones (usamos localStorage)
            localStorage.setItem('skillswap_token', token);
            login(token);

            // 2. Redirigir al usuario (ej: a la página de perfil)
            navigate('/home'); 
            
        } catch (err) {
            // Manejo de errores (ej: credenciales inválidas)
            setLoading(false);
            if (err.response && err.response.data) {
                const apiErrors = err.response.data;
                if (apiErrors.non_field_errors) {
                    setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
                } else if (apiErrors.email) {
                    setError(`Email: ${apiErrors.email[0]}`);
                } else if (apiErrors.password) {
                    setError(`Contraseña: ${apiErrors.password[0]}`);
                } else {
                    setError("Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
                }
            } else {
                setError("Error de red o servidor. Verifica tu conexión.");
            }
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Inicia Sesión
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    {/* Campo Email */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        // React Hook Form registration
                        {...register('email', { 
                            required: 'El email es obligatorio', 
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Formato de email incorrecto'
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email ? errors.email.message : ''}
                    />
                    
                    {/* Campo Contraseña */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        // React Hook Form registration
                        {...register('password', { required: 'La contraseña es obligatoria' })}
                        error={!!errors.password}
                        helperText={errors.password ? errors.password.message : ''}
                    />
                    
                    {/* Botón de Submit */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'INICIAR SESIÓN'}
                    </Button>
                    
                    <Stack spacing={1} sx={{ mt: 1 }}>
                        <Button color="secondary" onClick={() => navigate('/register')} fullWidth>
                            ¿No tienes cuenta? Regístrate aquí
                        </Button>
                        
                        {/* Botón para volver a atras */}
                        <Button 
                            variant="text" 
                            onClick={() => navigate('/')} 
                            fullWidth
                        >
                            Volver
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;