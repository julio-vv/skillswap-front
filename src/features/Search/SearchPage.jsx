import React from 'react';
import {
    Container, Typography, Box, TextField, InputAdornment,
    Card, CardContent, Avatar, Stack, Chip, CircularProgress,
    Alert, Grid, IconButton, Pagination
} from '@mui/material';
import { Search as SearchIcon, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { ROUTES } from '../../constants/routePaths';

const SearchPage = () => {
    const navigate = useNavigate();

    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        isLoading,
        error,
        hasSearched,
        currentPage,
        totalCount,
        totalPages,
        handlePageChange,
    } = useSearch();

    const onPageChange = (event, page) => {
        handlePageChange(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleUserClick = (userId) => {
        // Navegar al perfil del usuario
        navigate(ROUTES.USUARIO_BY_ID(userId));
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
                                    <Grid>
                                        <Avatar 
                                            src={user.media} 
                                            alt={user.nombre}
                                            sx={{ width: 60, height: 60 }}
                                        >
                                            {user.nombre?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Grid>

                                    {/* Información del usuario */}
                                    <Grid sx={{ flex: 1 }}>
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
                                    <Grid>
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
                {hasSearched && !isLoading && searchResults.length > 0 && totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={totalPages}
                            page={currentPage}
                            onChange={onPageChange}
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
