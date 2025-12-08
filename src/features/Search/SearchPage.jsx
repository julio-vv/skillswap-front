import React, { useMemo, useCallback, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from '../../hooks/useSearch';
import UserCard from '../../components/UserCard';
import { fetchSkillsMap } from '../../utils/skillsCache';

/**
 * Página de búsqueda de usuarios con paginación.
 * 
 * Optimizaciones:
 * - Mapa de habilidades cacheado a nivel global
 * - Resultados renderizados con UserCard memoizado
 * - useCallback para evitar re-renders de callbacks
 * - useMemo para construir mapa de habilidades extendido
 */
const SearchPage = () => {
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

    const [skillsMap, setSkillsMap] = useState(new Map());

    // Cargar mapa de habilidades desde caché global
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const skillsObjectMap = await fetchSkillsMap();
                setSkillsMap(new Map(Object.entries(skillsObjectMap)));
            } catch (err) {
                if (err.name !== 'AbortError') {
                    // Si falla la carga, continuamos sin el mapa cacheado
                    // Los IDs se mostrarán como fallback
                    console.error('Error al cargar mapa de habilidades:', err);
                }
            }
        })();

        return () => {
            controller.abort();
        };
    }, []);

    /**
     * Construir mapa de habilidades extendido
     * Combina el caché global con nombres embebidos en los usuarios
     */
    const skillsMapForRender = useMemo(() => {
        const map = new Map(skillsMap);

        searchResults.forEach(user => {
            const teach = user.habilidades_que_se_saben || [];
            const learn = user.habilidades_por_aprender || [];

            [...teach, ...learn].forEach(habilidad => {
                if (habilidad && typeof habilidad === 'object') {
                    const key = String(habilidad.id);
                    const value = habilidad.nombre_habilidad || habilidad.nombre;
                    if (key && value && !map.has(key)) {
                        map.set(key, value);
                    }
                }
            });
        });

        return map;
    }, [searchResults, skillsMap]);

    /**
     * Manejar cambio de página con scroll suave
     */
    const onPageChange = useCallback((event, page) => {
        handlePageChange(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }, [handlePageChange]);

    /**
     * Manejar cambio en la búsqueda
     */
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, [setSearchQuery]);

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
                    onChange={handleSearchChange}
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
                        <UserCard
                            key={user.id}
                            user={user}
                            skillsMap={skillsMapForRender}
                        />
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

SearchPage.displayName = 'SearchPage';
export default React.memo(SearchPage);
