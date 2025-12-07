import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { VALORACIONES } from '../constants/apiEndpoints';

/**
 * Hook para manejar la carga y gestión de reseñas/valoraciones
 * @param {number} profileUserId - ID del usuario cuyo perfil estamos viendo
 * @param {number} currentUserId - ID del usuario actual
 * @returns {Object} reviews, loading, isOwnProfile, ownReview, fetchReviews, saveReview, deleteReview
 */
export const useReviews = (profileUserId, currentUserId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [evaluadoresInfo, setEvaluadoresInfo] = useState({});

    const isOwnProfile = !profileUserId || (currentUserId && String(currentUserId) === String(profileUserId));
    const ownReview = reviews.find(r => r.evaluador === currentUserId) || null;

    /**
     * Cargar todas las reseñas del perfil actual
     */
    const fetchReviews = useCallback(async () => {
        if (!profileUserId) return; // Guard: no hacer nada si no hay ID del perfil
        
        setLoading(true);
        try {
            const resp = await axiosInstance.get(VALORACIONES);
            const allReviews = resp.data || [];
            
            // Filtrar solo reseñas del usuario actual si estamos viendo otro perfil
            const filtered = profileUserId 
                ? allReviews.filter(r => r.evaluado === parseInt(profileUserId))
                : allReviews;
            
            setReviews(filtered);

            // Cargar información de los evaluadores
            const loadEvaluadores = async () => {
                const newEvaluadoresInfo = {};
                for (const review of filtered) {
                    if (!newEvaluadoresInfo[review.evaluador]) {
                        try {
                            const userResp = await axiosInstance.get(`usuarios/${review.evaluador}/`);
                            newEvaluadoresInfo[review.evaluador] = userResp.data;
                        } catch (e) {
                            // Silenciosamente ignorar si no se carga la info del usuario
                            newEvaluadoresInfo[review.evaluador] = null;
                        }
                    }
                }
                setEvaluadoresInfo(prevInfo => ({ ...prevInfo, ...newEvaluadoresInfo }));
            };
            loadEvaluadores();
        } catch (e) {
            console.error('Error cargando valoraciones:', e._friendlyMessage || e.message);
            setReviews([]);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [profileUserId]);

    /**
     * Guardar una reseña (crear o actualizar)
     */
    const saveReview = useCallback(async (comentario, puntuacion) => {
        if (!profileUserId) throw new Error('No profile ID');
        
        try {
            if (ownReview) {
                // Actualizar reseña existente
                await axiosInstance.put(`${VALORACIONES}${ownReview.id}/`, {
                    evaluado: profileUserId,
                    puntuacion,
                    comentario,
                });
            } else {
                // Crear nueva reseña
                await axiosInstance.post(VALORACIONES, {
                    evaluado: profileUserId,
                    puntuacion,
                    comentario,
                });
            }
            await fetchReviews();
        } catch (e) {
            console.error('Error guardando valoración:', e._friendlyMessage || e.message);
            throw e;
        }
    }, [ownReview, profileUserId, fetchReviews]);

    /**
     * Eliminar una reseña
     */
    const deleteReview = useCallback(async (reviewId) => {
        try {
            await axiosInstance.delete(`${VALORACIONES}${reviewId}/`);
            await fetchReviews();
        } catch (e) {
            console.error('Error eliminando valoración:', e._friendlyMessage || e.message);
            throw e;
        }
    }, [fetchReviews]);

    return {
        reviews,
        loading,
        isOwnProfile,
        ownReview,
        evaluadoresInfo,
        fetchReviews,
        saveReview,
        deleteReview,
    };
};
