import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { fetchSkillsMap, expandSkills } from '../../../utils/skillsCache';

/**
 * Hook personalizado para gestionar la lista de amigos (matches)
 * - Obtiene la lista de matches del usuario autenticado
 * - Los matches vienen del atributo 'matches' del usuario
 * - Expande los datos de cada amigo con sus habilidades
 * 
 * Optimizado:
 * - Caché compartida de habilidades
 * - Llamadas HTTP en paralelo
 * - Prevención de memory leaks
 */
export const useFriends = () => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    /**
     * Obtiene la lista de amigos del usuario autenticado
     * Optimizado: llamadas en paralelo y caché compartida
     */
    const fetchFriends = useCallback(async () => {
        try {
            setLoading(true);
            
            // Obtener usuario autenticado y habilidades en paralelo
            const [authResponse, skillsMap] = await Promise.all([
                axiosInstance.get('/auth/user/'),
                fetchSkillsMap()
            ]);
            
            const userId = authResponse.data.id;
            
            // Obtener perfil del usuario (incluye matches)
            const userResponse = await axiosInstance.get(`/usuarios/${userId}/`);
            const userData = userResponse.data;
            const matchIds = userData.matches || [];
            
            if (matchIds.length === 0) {
                if (isMountedRef.current) {
                    setFriends([]);
                    setError(null);
                }
                setLoading(false);
                return;
            }
            
            // Obtener datos de todos los amigos en paralelo
            const friendsData = await Promise.all(
                matchIds.map(async (friendId) => {
                    try {
                        const friendResponse = await axiosInstance.get(`/usuarios/${friendId}/`);
                        const friendData = friendResponse.data;
                        
                        return {
                            ...friendData,
                            habilidades_ofrecer: expandSkills(
                                friendData.habilidades_que_se_saben,
                                skillsMap
                            ),
                            habilidades_aprender: expandSkills(
                                friendData.habilidades_por_aprender,
                                skillsMap
                            )
                        };
                    } catch (err) {
                        console.error(`Error fetching friend ${friendId}:`, err);
                        return null;
                    }
                })
            );
            
            // Filtrar nulls (amigos que no se pudieron cargar)
            const validFriends = friendsData.filter(friend => friend !== null);
            
            if (isMountedRef.current) {
                setFriends(validFriends);
                setError(null);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al cargar amigos';
            if (isMountedRef.current) {
                setError(errorMessage);
            }
            console.error('Error fetching friends:', err);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    /**
     * Efecto para cargar amigos al montar
     * Limpieza correcta para evitar memory leaks
     */
    useEffect(() => {
        isMountedRef.current = true;
        fetchFriends();
        
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchFriends]);

    return {
        friends,
        loading,
        error,
        fetchFriends
    };
};
