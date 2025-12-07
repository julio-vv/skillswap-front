import React, { useState, useCallback, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';
import { USUARIOS } from '../../constants/apiEndpoints';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useFetchData } from '../../hooks/useFetchData';
import MatchSection from './components/MatchSection';
import { filterUsersByMatchType } from './utils/skillHelpers';
import { PAGE_SIZE } from './constants/matchConstants';

const MatchesPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [page, setPage] = useState({ mutual: 1, teach: 1, learn: 1 });
    const [mutual, setMutual] = useState([]);
    const [teach, setTeach] = useState([]);
    const [learn, setLearn] = useState([]);
    const [hasMore, setHasMore] = useState({ mutual: false, teach: false, learn: false });

    const handleUserClick = useCallback((userId) => {
        navigate(ROUTES.USUARIO_BY_ID(userId));
    }, [navigate]);

    // Usar hook reutilizable para fetch
    const { loading, error, refetch } = useFetchData(
        async ({ signal }) => {
            const res = await axiosInstance.get(USUARIOS.coincidencias, { signal });
            const coincidencias = res.data || [];
            const { mutual, teach, learn } = filterUsersByMatchType(coincidencias);

            setMutual(mutual);
            setTeach(teach);
            setLearn(learn);
            setHasMore({
                mutual: mutual.length > PAGE_SIZE.mutual,
                teach: teach.length > PAGE_SIZE.teach,
                learn: learn.length > PAGE_SIZE.learn,
            });

            return coincidencias;
        },
        [],
        {
            initialData: [],
        }
    );

    const loadCoincidencias = refetch;

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

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                        Matches
                    </Typography>
                    <Button variant="contained" onClick={loadCoincidencias} disabled={loading}>
                        Actualizar coincidencias
                    </Button>
                </Stack>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Sección 1: Coincidencia mutua */}
                        <MatchSection
                            tipo="mutual"
                            users={paginated.mutual}
                            hasMore={hasMore.mutual}
                            onLoadMore={() => setPage(p => ({ ...p, mutual: p.mutual + 1 }))}
                            onUserClick={handleUserClick}
                            fullWidth
                        />

                        {/* Sección 2 y 3: Enseñar y Aprender */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MatchSection
                                    tipo="teach"
                                    users={paginated.teach}
                                    hasMore={hasMore.teach}
                                    onLoadMore={() => setPage(p => ({ ...p, teach: p.teach + 1 }))}
                                    onUserClick={handleUserClick}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <MatchSection
                                    tipo="learn"
                                    users={paginated.learn}
                                    hasMore={hasMore.learn}
                                    onLoadMore={() => setPage(p => ({ ...p, learn: p.learn + 1 }))}
                                    onUserClick={handleUserClick}
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default MatchesPage;