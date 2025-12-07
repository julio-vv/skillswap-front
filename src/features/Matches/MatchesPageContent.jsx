import React, { useState, useCallback, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';
import { USUARIOS } from '../../constants/apiEndpoints';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useFetchData } from '../../hooks/useFetchData';
import LazyMatchSection from './components/LazyMatchSection';
import { filterUsersByMatchType } from './utils/skillHelpers';
import { PAGE_SIZE } from './constants/matchConstants';

/**
 * MatchesPageContent - Componente de contenido de la página de Matches
 * Renderiza las secciones de coincidencias
 */
const MatchesPageContent = ({ mutual, teach, learn, page, setPage, onUserClick, onRefresh, loading = false, error = null }) => {
    const { showToast } = useToast();

    // Mostrar toast cuando hay error
    useEffect(() => {
        if (error) {
            showToast(error, 'error');
        }
    }, [error, showToast]);

    // Paginación local (solo muestra los primeros N y permite ver más)
    const paginated = {
        mutual: mutual.slice(0, page.mutual * PAGE_SIZE.mutual),
        teach: teach.slice(0, page.teach * PAGE_SIZE.teach),
        learn: learn.slice(0, page.learn * PAGE_SIZE.learn),
    };

    const hasMore = {
        mutual: mutual.length > page.mutual * PAGE_SIZE.mutual,
        teach: teach.length > page.teach * PAGE_SIZE.teach,
        learn: learn.length > page.learn * PAGE_SIZE.learn,
    };

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                        Matches
                    </Typography>
                    <Button variant="contained" onClick={onRefresh} disabled={loading}>
                        Actualizar coincidencias
                    </Button>
                </Stack>

                {/* Sección 1: Coincidencia mutua */}
                <LazyMatchSection
                    tipo="mutual"
                    users={paginated.mutual}
                    hasMore={hasMore.mutual}
                    onLoadMore={() => setPage(p => ({ ...p, mutual: p.mutual + 1 }))}
                    onUserClick={onUserClick}
                    fullWidth
                />

                {/* Sección 2 y 3: Enseñar y Aprender */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <LazyMatchSection
                            tipo="teach"
                            users={paginated.teach}
                            hasMore={hasMore.teach}
                            onLoadMore={() => setPage(p => ({ ...p, teach: p.teach + 1 }))}
                            onUserClick={onUserClick}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <LazyMatchSection
                            tipo="learn"
                            users={paginated.learn}
                            hasMore={hasMore.learn}
                            onLoadMore={() => setPage(p => ({ ...p, learn: p.learn + 1 }))}
                            onUserClick={onUserClick}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default MatchesPageContent;
