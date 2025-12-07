import React, { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';
import { USUARIOS } from '../../constants/apiEndpoints';
import axiosInstance from '../../api/axiosInstance';
import { useFetchData } from '../../hooks/useFetchData';
import { filterUsersByMatchType } from './utils/skillHelpers';
import MatchSection from './components/MatchSection';
import { useToast } from '../../context/ToastContext';

/**
 * MatchesPage - Container component
 * Loads match data and renders all categories inline
 */
export default function MatchesPage() {
    // Hooks deben ejecutarse siempre en el mismo orden
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [page, setPage] = useState({ mutual: 1, teach: 1, learn: 1 });
    const [mutual, setMutual] = useState([]);
    const [teach, setTeach] = useState([]);
    const [learn, setLearn] = useState([]);

    const handleUserClick = useCallback((userId) => {
        navigate(ROUTES.USUARIO_BY_ID(userId));
    }, [navigate]);

    const handleLoadMore = useCallback((tipo) => {
        setPage(prev => ({ ...prev, [tipo]: prev[tipo] + 1 }));
    }, []);

    // Usar hook reutilizable para fetch
    const { data: coincidencias, loading, error, refetch } = useFetchData(
        async ({ signal }) => {
            const res = await axiosInstance.get(USUARIOS.coincidencias, { signal });
            return res.data || [];
        },
        []
    );

    // Actualizar estados cuando coincidencias cambian
    React.useEffect(() => {
        if (coincidencias && coincidencias.length > 0) {
            const { mutual, teach, learn } = filterUsersByMatchType(coincidencias);
            setMutual(mutual);
            setTeach(teach);
            setLearn(learn);
        }
    }, [coincidencias]);

    // Show loading while data loads
    if (loading && mutual.length === 0 && teach.length === 0 && learn.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    const ITEMS_PER_PAGE = 5;
    const getMutualPaginated = () => mutual.slice(0, page.mutual * ITEMS_PER_PAGE);
    const getTeachPaginated = () => teach.slice(0, page.teach * ITEMS_PER_PAGE);
    const getLearnPaginated = () => learn.slice(0, page.learn * ITEMS_PER_PAGE);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Mutual Matches */}
                <Grid size={{ xs: 12 }}>
                    <MatchSection
                        tipo="mutual"
                        users={getMutualPaginated()}
                        hasMore={page.mutual * ITEMS_PER_PAGE < mutual.length}
                        onLoadMore={() => handleLoadMore('mutual')}
                        onUserClick={handleUserClick}
                        fullWidth={false}
                    />
                </Grid>

                {/* Can Teach */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <MatchSection
                        tipo="teach"
                        users={getTeachPaginated()}
                        hasMore={page.teach * ITEMS_PER_PAGE < teach.length}
                        onLoadMore={() => handleLoadMore('teach')}
                        onUserClick={handleUserClick}
                        fullWidth={false}
                    />
                </Grid>

                {/* Can Learn */}
                <Grid size={{ xs: 12, md: 6  }}>
                    <MatchSection
                        tipo="learn"
                        users={getLearnPaginated()}
                        hasMore={page.learn * ITEMS_PER_PAGE < learn.length}
                        onLoadMore={() => handleLoadMore('learn')}
                        onUserClick={handleUserClick}
                        fullWidth={true}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}