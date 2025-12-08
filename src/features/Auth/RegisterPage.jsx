import React, { useState } from 'react';
// Librerías
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'; // Integra validación Zod con React Hook Form
// import axiosInstance from '../../api/axiosInstance';
import axiosPublic from '../../api/axiosPublic';
import { useToast } from '../../context/ToastContext';
import { registerSchema } from '../../schemas/authSchema';
import { ERROR_MESSAGES, extractApiErrorMessage } from '../../constants/errorMessages';
import { AUTH } from '../../constants/apiEndpoints';
import { ROUTES } from '../../constants/routePaths';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword1, setShowPassword1] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const { showToast } = useToast();

    // Configurar React Hook Form con Zod Resolver
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            // Inicializa los valores para evitar advertencias de React
            email: '',
            password1: '',
            password2: '',
            nombre: '',
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
        hasUpperCase: /[A-Z]/.test(password1Value),
        notSimilarToEmail: emailValue && password1Value ? 
            !password1Value.toLowerCase().includes(emailValue.split('@')[0].toLowerCase()) &&
            !emailValue.toLowerCase().includes(password1Value.toLowerCase()) : true
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const response = await axiosPublic.post(AUTH.REGISTRATION, {
                email: data.email,
                password1: data.password1,
                password2: data.password2,
                nombre: data.nombre,
                apellido: data.apellido,
            });

            // Backend retorna el token tras registro exitoso
            const token = response.data.key;
            localStorage.setItem('skillswap_token', token);

            // Redirigir a home con flag para mostrar bienvenida
            navigate(ROUTES.HOME, { state: { registered: true } });

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
        <Container component="main" maxWidth="sm">
            <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Regístrate en Skill Swap
                </Typography>

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
                        
                    </Stack>
                    <TextField
                        required fullWidth margin="normal" label="Apellido" {...register('apellido')}
                        error={!!errors.apellido} helperText={errors.apellido?.message}
                    />

                    {/* Sección 2: Credenciales */}
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
                                        {showPassword1 ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.minLength ? 'success.main' : 'text.secondary'} noWrap>
                                        Mínimo 8 caracteres
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.hasNumber ? 
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.hasNumber ? 'success.main' : 'text.secondary'} noWrap>
                                        Al menos un número
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.hasLetter ? 
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.hasLetter ? 'success.main' : 'text.secondary'} noWrap>
                                        Al menos una letra
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.hasUpperCase ? 
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
                                    <Typography variant="caption" color={passwordRequirements.hasUpperCase ? 'success.main' : 'text.secondary'} noWrap>
                                        Al menos una mayúscula
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {passwordRequirements.notSimilarToEmail ? 
                                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', flexShrink: 0 }} /> : 
                                        <CancelIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />}
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
                                        {showPassword2 ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                        <Button color="secondary" onClick={() => navigate(ROUTES.LOGIN)} fullWidth>
                            ¿Ya tienes cuenta? Inicia sesión
                        </Button>
                        <Button variant="text" onClick={() => navigate(ROUTES.ROOT)} fullWidth>
                            Volver a Inicio
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;
