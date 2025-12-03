import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Container, Typography, Box, Alert, CircularProgress, Stack, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../../constants/errorMessages';
// import axiosInstance from '../../api/axiosInstance';
import axiosPublic from '../../api/axiosPublic';
import { AUTH } from '../../constants/apiEndpoints';
import { ROUTES } from '../../constants/routePaths';

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
            // Llamar al endpoint POST /auth/login/
            const response = await axiosPublic.post(AUTH.LOGIN, {
                email: data.email,
                password: data.password,
            });

            // La API devuelve { "key": "<token>" }
            const token = response.data.key;
            
            // El login ahora obtiene automáticamente los datos del usuario
            await login(token);

            // Redirigir al usuario
            navigate(ROUTES.HOME); 
            
        } catch (err) {
            setLoading(false);
            
            // Manejo de errores centralizado
            if (err.response?.data) {
                const msg = extractApiErrorMessage(err.response.data);
                setError(msg || ERROR_MESSAGES.unexpected);
            } else if (err.request) {
                setError(ERROR_MESSAGES.network);
            } else {
                setError(err.message || ERROR_MESSAGES.unexpected);
            }
        }
    };

    return (
        <Container 
            component="main" 
            maxWidth="xs"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                }}
            >
                <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
                    Inicia Sesión
                </Typography>
                
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ width: '100%', mb: 2 }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
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
                        {...register('email', { 
                            required: 'El email es obligatorio', 
                            pattern: {
                                value: /^\S+@\S+$/i,
                                message: 'Formato de email incorrecto'
                            }
                        })}
                        error={!!errors.email}
                        helperText={errors.email ? errors.email.message : ''}
                        sx={{
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                                WebkitTextFillColor: 'inherit',
                                caretColor: 'inherit',
                                borderRadius: 'inherit',
                            },
                            '& input:-webkit-autofill:hover': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                            '& input:-webkit-autofill:focus': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                            '& input:-webkit-autofill:active': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                        }}
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
                        {...register('password', { required: 'La contraseña es obligatoria' })}
                        error={!!errors.password}
                        helperText={errors.password ? errors.password.message : ''}
                        sx={{
                            '& input:-webkit-autofill': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                                WebkitTextFillColor: 'inherit',
                                caretColor: 'inherit',
                                borderRadius: 'inherit',
                            },
                            '& input:-webkit-autofill:hover': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                            '& input:-webkit-autofill:focus': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                            '& input:-webkit-autofill:active': {
                                WebkitBoxShadow: '0 0 0 100px transparent inset',
                            },
                        }}
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
                        <Button color="secondary" onClick={() => navigate(ROUTES.REGISTER)} fullWidth>
                            ¿No tienes cuenta? Regístrate aquí
                        </Button>
                        
                        {/* Botón para volver a atras */}
                        <Button 
                            variant="text" 
                            onClick={() => navigate(ROUTES.ROOT)} 
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