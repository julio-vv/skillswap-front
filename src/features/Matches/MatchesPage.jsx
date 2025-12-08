import React, { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';
import { USUARIOS } from '../../constants/apiEndpoints';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useFetchData } from '../../hooks/useFetchData';
import LazyMatchSection from './components/LazyMatchSection';
import { filterUsersByMatchType } from './utils/skillHelpers';
import { PAGE_SIZE } from './constants/matchConstants';

export default function MatchesPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [page, setPage] = useState({ mutual: 1, teach: 1, learn: 1 });
    const [mutual, setMutual] = useState([]);
    const [teach, setTeach] = useState([]);
    const [learn, setLearn] = useState([]);

    const handleUserClick = useCallback((userId) => {
        navigate(ROUTES.USUARIO_BY_ID(userId));
    }, [navigate]);

    const { data, loading, error, refetch } = useFetchData(
        async ({ signal }) => {
            const res = await axiosInstance.get(USUARIOS.coincidencias, { signal });
            return res.data || [];
        },
        [],
        { initialData: [] }
    );

    useEffect(() => {
        if (Array.isArray(data)) {
            const { mutual, teach, learn } = filterUsersByMatchType(data);
            setMutual(mutual);
            setTeach(teach);
            setLearn(learn);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            showToast(error, 'error');
        }
    }, [error, showToast]);

    if (loading && mutual.length === 0 && teach.length === 0 && learn.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

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
                    <Button variant="contained" onClick={refetch} disabled={loading}>
                        Actualizar coincidencias
                    </Button>
                </Stack>

                <LazyMatchSection
                    tipo="mutual"
                    users={paginated.mutual}
                    hasMore={hasMore.mutual}
                    onLoadMore={() => setPage(p => ({ ...p, mutual: p.mutual + 1 }))}
                    onUserClick={handleUserClick}
                    fullWidth
                />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <LazyMatchSection
                            tipo="teach"
                            users={paginated.teach}
                            hasMore={hasMore.teach}
                            onLoadMore={() => setPage(p => ({ ...p, teach: p.teach + 1 }))}
                            onUserClick={handleUserClick}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <LazyMatchSection
                            tipo="learn"
                            users={paginated.learn}
                            hasMore={hasMore.learn}
                            onLoadMore={() => setPage(p => ({ ...p, learn: p.learn + 1 }))}
                            onUserClick={handleUserClick}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}