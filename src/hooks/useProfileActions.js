import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { ROUTES } from '../constants/routePaths';
import { useToast } from '../context/ToastContext';
import { USUARIOS } from '../constants/apiEndpoints';

/**
 * Hook para manejar acciones de match/chat/remove en el perfil
 * Centraliza lógica de match requests, chat, y eliminación de amigos
 */
export const useProfileActions = (urlUserId, user, fetchProfile) => {
    const { showToast } = useToast();
    const [matchStatus, setMatchStatus] = useState(null); // null, 'pending', 'matched', 'pending-received'
    const [pendingRequestId, setPendingRequestId] = useState(null);

    /**
     * Detectar si el usuario visto es amigo del usuario actual
     */
    const isFriend = (profileData) => {
        return profileData?.matches?.some(id => String(id) === String(user?.id));
    };

    /**
     * Actualizar match status cuando hay cambios
     */
    const updateMatchStatus = useCallback((profileData, requests) => {
        if (isFriend(profileData)) {
            setMatchStatus('matched');
            setPendingRequestId(null);
            return;
        }

        if (!urlUserId || !requests) return;

        const pendingRequest = requests.find(req =>
            req.emisor &&
            String(req.emisor.id) === String(urlUserId) &&
            (req.estado === 'indefinido' || req.estado === 'pendiente')
        );

        if (pendingRequest) {
            setMatchStatus('pending-received');
            setPendingRequestId(pendingRequest.id);
        } else {
            setMatchStatus(null);
            setPendingRequestId(null);
        }
    }, [urlUserId, user?.id]);

    /**
     * Iniciar chat con el usuario visto
     */
    const handleStartChat = useCallback(() => {
        if (!urlUserId) return;
        window.location.href = ROUTES.CHAT_CONVERSACION(urlUserId);
    }, [urlUserId]);

    /**
     * Eliminar amigo/match
     */
    const handleRemoveFriend = useCallback(async () => {
        if (!urlUserId) return;
        const confirmed = window.confirm('¿Eliminar a este amigo? Esta acción no se puede deshacer.');
        if (!confirmed) return;

        try {
            await axiosInstance.delete(USUARIOS.coincidenciaById(urlUserId));
            await fetchProfile();
            setMatchStatus(null);
            showToast('Amigo eliminado correctamente', 'success');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Error al eliminar amigo';
            showToast(errorMsg, 'error');
        }
    }, [urlUserId, fetchProfile, showToast]);

    return {
        matchStatus,
        pendingRequestId,
        isFriend,
        updateMatchStatus,
        handleStartChat,
        handleRemoveFriend,
        setMatchStatus,
        setPendingRequestId,
    };
};
