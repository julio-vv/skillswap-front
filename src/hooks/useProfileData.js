import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useErrorHandler } from './useErrorHandler';
import { formatProfileDataForForm } from '../utils/formatProfileDataForForm';

/**
 * Hook para manejar la lógica de datos de perfil
 * @param {string|null} userId - ID del usuario a cargar (null para usuario actual)
 * @returns {Object} Estado y funciones para manejar datos de perfil
 */
export const useProfileData = (userId = null) => {
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [allSkills, setAllSkills] = useState([]);
    const [skillTypes, setSkillTypes] = useState([]);
    const { error, handleError, clearError } = useErrorHandler();

    /**
     * Obtiene los datos del perfil del usuario
     */
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        clearError();
        
        try {
            const endpoint = userId ? `usuarios/${userId}/` : 'auth/user/';
            const response = await axiosInstance.get(endpoint);
            setProfileData(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'fetchProfile');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [userId, clearError, handleError]);

    /**
     * Obtiene las habilidades y tipos de habilidad disponibles
     */
    const fetchSkillData = useCallback(async () => {
        try {
            const [skillsResponse, typesResponse] = await Promise.all([
                axiosInstance.get('habilidades/'),
                axiosInstance.get('tipos-habilidad/')
            ]);

            setAllSkills(skillsResponse.data);
            setSkillTypes(typesResponse.data);
        } catch (err) {
            handleError(err, 'fetchSkillData');
        }
    }, [handleError]);

    /**
     * Actualiza los datos del perfil
     * @param {Object} data - Datos a actualizar
     * @param {boolean} hasFile - Indica si los datos incluyen un archivo
     * @returns {Object|null} Datos actualizados o null si hay error
     */
    const updateProfile = async (data, hasFile = false) => {
        clearError();
        
        try {
            const payload = hasFile ? createFormData(data) : prepareJsonPayload(data);
            const idForEndpoint = userId || profileData?.id;
            const endpoint = idForEndpoint ? `usuarios/${idForEndpoint}/` : 'usuarios/me/';
            
            const response = await axiosInstance.patch(endpoint, payload);
            setProfileData(response.data);
            return response.data;
        } catch (err) {
            handleError(err, 'updateProfile');
            return null;
        }
    };

    /**
     * Prepara los datos del formulario para envío JSON
     * @param {Object} data - Datos del formulario
     * @returns {Object} Datos preparados
     */
    const prepareJsonPayload = (data) => {
        const payload = { ...data };
        
        // Si media es un string (URL existente), no la enviamos
        if (payload.media && typeof payload.media === 'string') {
            delete payload.media;
        }
        
        return payload;
    };

    /**
     * Crea FormData para envío de archivos
     * @param {Object} data - Datos del formulario
     * @returns {FormData} FormData preparado
     */
    const createFormData = (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'habilidades' && Array.isArray(value)) {
                // Enviar múltiples entradas con la misma clave
                value.forEach(id => formData.append('habilidades', id));
            } else if (key === 'media') {
                // Agregar el archivo solo si es un File
                const file = value instanceof FileList ? value[0] : value;
                if (file instanceof File) {
                    formData.append('media', file);
                }
            } else if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value);
            }
        });

        return formData;
    };


    // Cargar datos al montar el componente o cuando cambie userId
    useEffect(() => {
        fetchProfile();
        fetchSkillData();
    }, [fetchProfile, fetchSkillData]);

    return {
        profileData,
        isLoading,
        error,
        allSkills,
        skillTypes,
        fetchProfile,
        updateProfile,
        clearError,
    };
};
