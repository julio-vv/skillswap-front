import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { fetchSkillsMap, expandSkills } from '../../../utils/skillsCache';
import { useAuth } from '../../Auth/AuthContext';
import { SOLICITUDES_MATCH, USUARIOS, AUTH } from '../../../constants/apiEndpoints';

/**
 * Hook personalizado para gestionar solicitudes de match
 * - Obtiene solicitudes pendientes recibidas
 * - Envía nuevas solicitudes de match
 * - Acepta solicitudes (crea matches en ambos perfiles)
 * - Rechaza solicitudes
 * 
 * Optimizado:
 * - Caché de habilidades compartido
 * - Llamadas en paralelo donde es posible
 * - Prevención de memory leaks
 */
export const useMatchRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // ID de la solicitud en proceso
    const controllerRef = useRef(null);

    /**
     * Obtiene todas las solicitudes de match del usuario
     * GET /api/solicitudes-match/
     * Devuelve solicitudes donde el usuario es receptor
     * Expande los datos del emisor haciendo peticiones adicionales
     * 
     * Optimizado: Caché compartida de habilidades + llamadas en paralelo
     */
    const fetchRequests = useCallback(async () => {
        // Cancelar petición previa si sigue en vuelo
        if (controllerRef.current) {
            controllerRef.current.abort();
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            // Obtener solicitudes y habilidades en paralelo
            const [response, skillsMap] = await Promise.all([
                axiosInstance.get(SOLICITUDES_MATCH.listar, { signal: controller.signal }),
                fetchSkillsMap()
            ]);

            const data = response.data;

            // Filtrar solo solicitudes pendientes (estado indefinido) RECIBIDAS por el usuario actual
            const pendingRequests = data.filter(req =>
                (req.estado === 'indefinido' || req.estado === 'pendiente') &&
                req.recipiente === user?.id
            );

            // Fetch de emisores sin duplicar
            const uniqueEmitterIds = Array.from(new Set(pendingRequests.map(req => req.emisor)));

            const emitterEntries = await Promise.all(uniqueEmitterIds.map(async (emisorId) => {
                try {
                    const userResponse = await axiosInstance.get(USUARIOS.detalle(emisorId), { signal: controller.signal });
                    return [emisorId, userResponse.data];
                } catch (err) {
                    const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
                    if (isCanceled) return [emisorId, null];
                    console.error(`Error fetching user ${emisorId}:`, err);
                    return [emisorId, null];
                }
            }));

            const emitterMap = Object.fromEntries(emitterEntries);

            const requestsWithUserData = pendingRequests.map((request) => {
                const userData = emitterMap[request.emisor];

                if (!userData) {
                    return {
                        ...request,
                        emisor: {
                            id: request.emisor,
                            nombre: 'Usuario',
                            apellido: '',
                            habilidades_ofrecer: [],
                            habilidades_aprender: []
                        }
                    };
                }

                return {
                    ...request,
                    emisor: {
                        ...userData,
                        habilidades_ofrecer: expandSkills(
                            userData.habilidades_que_se_saben,
                            skillsMap
                        ),
                        habilidades_aprender: expandSkills(
                            userData.habilidades_por_aprender,
                            skillsMap
                        )
                    }
                };
            });

            if (!controller.signal.aborted) {
                setRequests(requestsWithUserData);
                setError(null);
            }
        } catch (err) {
            const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
            if (isCanceled) return;

            const errorMsg = err.response?.data?.message || 'Error al cargar solicitudes';
            setError(errorMsg);
            console.error('Error fetching match requests:', err);
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [user?.id]);

    /**
     * Envía una nueva solicitud de match a otro usuario
     * POST /api/solicitudes-match/
     * @param {number} recipienteId - ID del usuario destinatario
     */
    const sendRequest = useCallback(async (recipienteId) => {
        try {
            setActionLoading(recipienteId);
            await axiosInstance.post('/solicitudes-match/', {
                recipiente: recipienteId
            });
            
            // Refrescar lista de solicitudes
            await fetchRequests();
            setError(null);
            return { success: true };
        } catch (err) {
            // Extraer mensaje de error de diferentes formatos de Django REST Framework
            let errorMsg = 'Error al enviar solicitud';
            
            if (err.response?.data) {
                const data = err.response.data;
                if (data.message) {
                    errorMsg = data.message;
                } else if (data.error) {
                    errorMsg = data.error;
                } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
                    errorMsg = data.non_field_errors[0];
                } else if (data.detail) {
                    errorMsg = data.detail;
                }
            }
            
            setError(errorMsg);
            console.error('Error sending match request:', err);
            return { success: false, error: errorMsg };
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests]);

    /**
     * Acepta una solicitud de match
     * POST /api/solicitudes-match/<id>/aceptar/
     * Crea matches en ambos perfiles y genera notificación para el emisor
     * @param {number} requestId - ID de la solicitud
     */
    const acceptRequest = useCallback(async (requestId) => {
        try {
            setActionLoading(requestId);
            await axiosInstance.post(`/solicitudes-match/${requestId}/aceptar/`);
            
            // Refrescar lista de solicitudes
            await fetchRequests();
            setError(null);
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Error al aceptar solicitud';
            setError(errorMsg);
            console.error('Error accepting match request:', err);
            return { success: false, error: errorMsg };
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests]);

    /**
     * Rechaza una solicitud de match
     * POST /api/solicitudes-match/<id>/rechazar/
     * Cambia el estado a 'rechazado' y genera notificación para el emisor
     * @param {number} requestId - ID de la solicitud
     */
    const rejectRequest = useCallback(async (requestId) => {
        try {
            setActionLoading(requestId);
            await axiosInstance.post(`/solicitudes-match/${requestId}/rechazar/`);
            
            // Refrescar lista de solicitudes
            await fetchRequests();
            setError(null);
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.message || 
                           err.response?.data?.error || 
                           'Error al rechazar solicitud';
            setError(errorMsg);
            console.error('Error rejecting match request:', err);
            return { success: false, error: errorMsg };
        } finally {
            setActionLoading(null);
        }
    }, [fetchRequests]);

    /**
     * Efecto para cargar solicitudes al montar
     * Limpieza correcta para evitar memory leaks
     */
    useEffect(() => {
        fetchRequests();

        return () => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        actionLoading,
        fetchRequests,
        sendRequest,
        acceptRequest,
        rejectRequest
    };
};
