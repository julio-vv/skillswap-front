import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ROUTES } from '../constants/routePaths';
import { useToast } from '../context/ToastContext';
import { USUARIOS, CHAT } from '../constants/apiEndpoints';

/**
 * Hook para manejar acciones de match/chat/remove en el perfil
 * Centraliza lógica de match requests, chat, y eliminación de amigos
 */
export const useProfileActions = (urlUserId, user, fetchProfile) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [matchStatus, setMatchStatus] = useState(null); // null, 'pending', 'matched', 'pending-received'
    const [pendingRequestId, setPendingRequestId] = useState(null);
    const [startingChat, setStartingChat] = useState(false);

    /**
     * Detectar si el usuario visto es amigo del usuario actual (función pura)
     */
    const isFriend = (profileData) => {
        return profileData?.matches?.some(id => String(id) === String(user?.id));
    };

    /**
     * Actualizar match status cuando hay cambios
     */
    const updateMatchStatus = useCallback((profileData, requests) => {
        if (profileData?.matches?.some(id => String(id) === String(user?.id))) {
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
     * Obtiene o crea una conversación antes de navegar
     */
    const handleStartChat = useCallback(async () => {
        if (!urlUserId) return;
        
        try {
            setStartingChat(true);
            
            // Primero obtener conversaciones existentes
            const conversationsResponse = await axiosInstance.get(CHAT.conversaciones);
            
            // Buscar una conversación existente con este usuario
            const existingConversation = conversationsResponse.data.find(conv => {
                return conv.participantes && conv.participantes.includes(parseInt(urlUserId));
            });
            
            if (existingConversation) {
                // Si existe, navegar a ella
                console.log(`[Chat] Conversación existente encontrada: ${existingConversation.id}`);
                navigate(ROUTES.CHAT_CONVERSACION(existingConversation.id));
                return;
            }
            
            // Si no existe, crear una nueva
            console.log(`[Chat] Creando nueva conversación con usuario ${urlUserId}`);
            const response = await axiosInstance.post(CHAT.conversaciones, {
                participantes: [parseInt(urlUserId)]
            });
            
            if (response.data && response.data.id) {
                navigate(ROUTES.CHAT_CONVERSACION(response.data.id));
                showToast('Conversación iniciada', 'success');
            }
        } catch (err) {
            console.error('Error al iniciar chat:', err);
            showToast('Error al iniciar la conversación', 'error');
        } finally {
            setStartingChat(false);
        }
    }, [urlUserId, navigate, showToast]);

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
        startingChat,
    };
};
