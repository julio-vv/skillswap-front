import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { fetchSkillsMap, expandSkills } from '../../../utils/skillsCache';
import { AUTH, USUARIOS } from '../../../constants/apiEndpoints';

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
    const controllerRef = useRef(null);

    /**
     * Obtiene la lista de amigos del usuario autenticado
     * Optimizado: llamadas en paralelo y caché compartida
     */
    const fetchFriends = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Cancelar petición previa si sigue en vuelo
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            const controller = new AbortController();
            controllerRef.current = controller;
            
            // Obtener usuario autenticado y habilidades en paralelo
            const [authResponse, skillsMap] = await Promise.all([
                axiosInstance.get(AUTH.USER, { signal: controller.signal }),
                fetchSkillsMap()
            ]);
            
            const userId = authResponse.data.id;
            
            // Obtener perfil del usuario (incluye matches)
            const userResponse = await axiosInstance.get(USUARIOS.detalle(userId), { signal: controller.signal });
            const userData = userResponse.data;
            const matchIds = userData.matches || [];
            const uniqueMatchIds = [...new Set(matchIds)];
            
            if (uniqueMatchIds.length === 0) {
                if (isMountedRef.current) {
                    setFriends([]);
                    setError(null);
                }
                setLoading(false);
                return;
            }
            
            // Obtener datos de todos los amigos en paralelo
            const friendsData = await Promise.all(
                uniqueMatchIds.map(async (friendId) => {
                    try {
                        const friendResponse = await axiosInstance.get(USUARIOS.detalle(friendId), { signal: controller.signal });
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
                        const isCanceled = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
                        if (isCanceled) return null;
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
            const isCanceled = err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED';
            if (isCanceled) return;
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
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchFriends]);

    return {
        friends,
        loading,
        error,
        fetchFriends
    };
};
