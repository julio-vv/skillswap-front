import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, TextField, InputAdornment,
    Card, CardContent, Avatar, Stack, Chip, CircularProgress,
    Alert, Grid, IconButton, Pagination
} from '@mui/material';
import { Search as SearchIcon, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);

    // Debounce: ejecutar búsqueda después de 500ms sin escribir
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            setCurrentPage(1);
            setTotalCount(0);
            return;
        }

        const delayDebounce = setTimeout(() => {
            setCurrentPage(1); // Reiniciar a página 1 en nueva búsqueda
            performSearch(searchQuery, 1);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const performSearch = async (query, page = 1) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await axiosInstance.get(
                `usuarios/buscar/?q=${encodeURIComponent(query)}&page=${page}`
            );
            
            // Manejar respuesta paginada o lista directa
            if (response.data.results) {
                // Respuesta paginada
                setSearchResults(response.data.results);
                setTotalCount(response.data.count || 0);
                setNextUrl(response.data.next);
                setPrevUrl(response.data.previous);
                
                // Calcular pageSize desde la respuesta si es posible
                if (response.data.results.length > 0) {
                    setPageSize(response.data.results.length);
                }
            } else {
                // Lista directa (sin paginación)
                setSearchResults(Array.isArray(response.data) ? response.data : []);
                setTotalCount(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (err) {
            console.error('Error en búsqueda:', err);
            if (err.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
            } else {
                setError('Error al realizar la búsqueda. Intenta de nuevo.');
            }
            setSearchResults([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        performSearch(searchQuery, page);
        // Scroll al inicio de los resultados
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleUserClick = (userId) => {
        // Navegar al perfil del usuario
        navigate(`/usuarios/${userId}`);
    };

    return (
        <Box>
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {/* Título */}
                <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                    Buscar Usuarios
                </Typography>

                {/* Barra de búsqueda */}
                <TextField
                    fullWidth
                    placeholder="Busca por nombre, apellido o habilidad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: isLoading && (
                            <InputAdornment position="end">
                                <CircularProgress size={20} />
                            </InputAdornment>
                        )
                    }}
                    sx={{ mb: 3 }}
                />

                {/* Mensajes de estado */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!hasSearched && (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            Escribe para buscar usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Busca por nombre, apellido o habilidades
                        </Typography>
                    </Box>
                )}

                {hasSearched && !isLoading && searchResults.length === 0 && !error && (
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Intenta con otros términos de búsqueda
                        </Typography>
                    </Box>
                )}

                {/* Contador de resultados */}
                {hasSearched && !isLoading && searchResults.length > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {totalCount > 0 ? `${totalCount} usuario${totalCount !== 1 ? 's' : ''} encontrado${totalCount !== 1 ? 's' : ''}` : ''}
                    </Typography>
                )}

                {/* Resultados de búsqueda */}
                <Stack spacing={2}>
                    {searchResults.map((user) => (
                        <Card 
                            key={user.id} 
                            sx={{ 
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3
                                }
                            }}
                            onClick={() => handleUserClick(user.id)}
                        >
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    {/* Avatar */}
                                    <Grid item>
                                        <Avatar 
                                            src={user.media} 
                                            alt={user.nombre}
                                            sx={{ width: 60, height: 60 }}
                                        >
                                            {user.nombre?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Grid>

                                    {/* Información del usuario */}
                                    <Grid item xs>
                                        <Typography variant="h6">
                                            {user.nombre} {user.segundo_nombre} {user.apellido}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {user.email}
                                        </Typography>

                                        {/* Habilidades */}
                                        {user.habilidades && user.habilidades.length > 0 && (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {user.habilidades.slice(0, 3).map((habilidad) => (
                                                    <Chip 
                                                        key={habilidad.id || habilidad}
                                                        label={
                                                            typeof habilidad === 'object' 
                                                                ? (habilidad.nombre_habilidad || habilidad.nombre)
                                                                : habilidad
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {user.habilidades.length > 3 && (
                                                    <Chip 
                                                        label={`+${user.habilidades.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        )}
                                    </Grid>

                                    {/* Botón de acción */}
                                    <Grid item>
                                        <IconButton 
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUserClick(user.id);
                                            }}
                                        >
                                            <PersonAdd />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>

                {/* Paginación */}
                {hasSearched && !isLoading && searchResults.length > 0 && totalCount > pageSize && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={Math.ceil(totalCount / pageSize)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default SearchPage;
