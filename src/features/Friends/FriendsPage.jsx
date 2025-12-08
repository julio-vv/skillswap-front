import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    Paper,
    Stack,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useToast } from '../../context/ToastContext';
import { useFriends } from './hooks/useFriends';
import FriendCard from './components/FriendCard';

/**
 * Página principal de lista de amigos/matches
 * Muestra todos los matches del usuario con opción de búsqueda
 * Permite iniciar chat con cada amigo
 */
const FriendsPage = () => {
    const { friends, loading, error, fetchFriends } = useFriends();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    // Mostrar toast cuando hay error
    useEffect(() => {
        if (error) {
            showToast(error, 'error');
        }
    }, [error, showToast]);

    /**
     * Filtra amigos según la búsqueda
     */
    const searchLower = searchQuery.trim().toLowerCase();
    const filteredFriends = friends.filter(friend => {
        const nombre = (friend.nombre || '').toLowerCase();
        const apellido = (friend.apellido || '').toLowerCase();
        const email = (friend.email || '').toLowerCase();
        const nombreCompleto = `${nombre} ${apellido}`.trim();
        
        return nombreCompleto.includes(searchLower) || email.includes(searchLower);
    });

    // Estado de carga
    if (loading && friends.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header con título y contador */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={3}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box sx={{ flex: 1, ml: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Mis Amigos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={fetchFriends}
                    disabled={loading}
                >
                    {loading ? 'Actualizando…' : 'Actualizar'}
                </Button>
            </Stack>

            {/* Barra de búsqueda */}
            {friends.length > 0 && (
                <TextField
                    fullWidth
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                />
            )}

            {/* Lista de amigos */}
            {friends.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aún no tienes amigos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Acepta solicitudes de match para empezar a conectar con otros usuarios
                    </Typography>
                </Paper>
            ) : filteredFriends.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No se encontraron amigos con "{searchQuery}"
                    </Typography>
                </Paper>
            ) : (
                <Box>
                    {filteredFriends.map((friend) => (
                        <FriendCard
                            key={friend.id}
                            friend={friend}
                        />
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default FriendsPage;
