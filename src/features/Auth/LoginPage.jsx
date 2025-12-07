import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../context/ToastContext';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../../constants/errorMessages';
// import axiosInstance from '../../api/axiosInstance';
import axiosPublic from '../../api/axiosPublic';
import { AUTH } from '../../constants/apiEndpoints';
import { ROUTES } from '../../constants/routePaths';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();

    const onSubmit = async (data) => {
        setLoading(true);
        
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
                showToast(msg || ERROR_MESSAGES.unexpected, 'error');
            } else if (err.request) {
                showToast(ERROR_MESSAGES.network, 'error');
            } else {
                showToast(err.message || ERROR_MESSAGES.unexpected, 'error');
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
                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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