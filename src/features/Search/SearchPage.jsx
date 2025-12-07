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
 * Página de búsqueda de usuarios
 * Optimizada:
 * - Sin descarga redundante de habilidades
 * - Componente UserCard memoizado reutilizable
 * - SearchPage memoizado con useCallback
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

    // Mapa global de habilidades (id -> nombre) desde caché compartido
    const [skillsMap, setSkillsMap] = useState(new Map());

    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const skillsObjectMap = await fetchSkillsMap();
                if (!isMounted) return;
                setSkillsMap(new Map(Object.entries(skillsObjectMap)));
            } catch (err) {
                // Silencioso: si falla, se mostrarán IDs como fallback
                console.error('Error cargando habilidades:', err);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Construir mapa de habilidades desde usuarios
     * Memoizado: solo se recalcula si searchResults cambia
     */
    const skillsMapForRender = useMemo(() => {
        // Construir un mapa extendido combinando el caché global + nombres embebidos
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

export default React.memo(SearchPage);
