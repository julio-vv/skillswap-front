import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { HABILIDADES } from '../../constants/apiEndpoints';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { ROUTES } from '../../constants/routePaths';

const SearchPage = () => {
    const navigate = useNavigate();
    const [skillsList, setSkillsList] = useState([]);

    useEffect(() => {
        let mounted = true;
        axiosInstance.get(HABILIDADES)
            .then(res => { if (mounted) setSkillsList(res.data || []); })
            .catch(() => { /* silencioso: no bloquear resultados si falla */ });
        return () => { mounted = false; };
    }, []);

    const skillsMap = useMemo(() => {
        const map = new Map();
        for (const s of skillsList) {
            if (s && s.id != null) {
                map.set(String(s.id), s.nombre_habilidad || s.nombre || '');
            }
        }
        return map;
    }, [skillsList]);

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
        <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                {/* Título */}
                <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
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
                                    {/* Columna 1: Avatar + datos */}
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            src={user.media} 
                                            alt={user.nombre}
                                            sx={{ width: 60, height: 60 }}
                                        >
                                            {user.nombre?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h6" noWrap>
                                            {user.nombre} {user.apellido}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    {/* Columna 2: Habilidades que saben */}
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Sabe enseñar
                                        </Typography>
                                        {user.habilidades_que_se_saben && user.habilidades_que_se_saben.length > 0 ? (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {user.habilidades_que_se_saben.slice(0, 3).map((habilidad) => (
                                                    <Chip 
                                                        key={(typeof habilidad === 'object' ? habilidad.id : habilidad) ?? Math.random()}
                                                        label={(
                                                            (() => {
                                                                if (habilidad && typeof habilidad === 'object') {
                                                                    return habilidad.nombre_habilidad || habilidad.nombre;
                                                                }
                                                                const name = skillsMap.get(String(habilidad));
                                                                return name || String(habilidad);
                                                            })()
                                                        )}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {user.habilidades_que_se_saben.length > 3 && (
                                                    <Chip 
                                                        label={`+${user.habilidades_que_se_saben.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
                                        )}
                                    </Grid>

                                    {/* Columna 3: Habilidades por aprender */}
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                                            Quiere aprender
                                        </Typography>
                                        {user.habilidades_por_aprender && user.habilidades_por_aprender.length > 0 ? (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {user.habilidades_por_aprender.slice(0, 3).map((habilidad) => (
                                                    <Chip 
                                                        key={(typeof habilidad === 'object' ? habilidad.id : habilidad) ?? Math.random()}
                                                        label={(
                                                            (() => {
                                                                if (habilidad && typeof habilidad === 'object') {
                                                                    return habilidad.nombre_habilidad || habilidad.nombre;
                                                                }
                                                                const name = skillsMap.get(String(habilidad));
                                                                return name || String(habilidad);
                                                            })()
                                                        )}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {user.habilidades_por_aprender.length > 3 && (
                                                    <Chip 
                                                        label={`+${user.habilidades_por_aprender.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">Sin datos</Typography>
                                        )}
                                    </Grid>

                                    {/* Botón de acción */}
                                    <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                        <IconButton 
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUserClick(user.id);
                                            }}
                                        >
                                                <ChevronRightIcon />
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
