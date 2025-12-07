import React, { useCallback, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routePaths';
import { USUARIOS } from '../../constants/apiEndpoints';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../context/ToastContext';
import { useFetchData } from '../../hooks/useFetchData';
import { filterUsersByMatchType } from './utils/skillHelpers';
import MatchesPageContent from './MatchesPageContent';

/**
 * MatchesPage - Container con lógica de datos
 * Carga datos de coincidencias y renderiza el contenido
 */
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

    // Usar hook reutilizable para fetch
    const { loading, error, refetch } = useFetchData(
        async ({ signal }) => {
            const res = await axiosInstance.get(USUARIOS.coincidencias, { signal });
            const coincidencias = res.data || [];
            const { mutual, teach, learn } = filterUsersByMatchType(coincidencias);

            setMutual(mutual);
            setTeach(teach);
            setLearn(learn);

            return coincidencias;
        },
        [],
        {
            initialData: [],
        }
    );

    // Mostrar loading mientras se cargan los datos
    if (loading && mutual.length === 0 && teach.length === 0 && learn.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <MatchesPageContent
            mutual={mutual}
            teach={teach}
            learn={learn}
            page={page}
            setPage={setPage}
            onUserClick={handleUserClick}
            onRefresh={refetch}
            loading={loading}
            error={error}
        />
    );
}
