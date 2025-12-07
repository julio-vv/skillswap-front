import axiosInstance from '../api/axiosInstance';
import { HABILIDADES } from '../constants/apiEndpoints';

/**
 * Sistema de caché para habilidades
 * Evita peticiones repetidas de habilidades a lo largo de la app
 * 
 * Características:
 * - Caché en memoria con duración configurable
 * - Manejo de errores silencioso (devuelve caché anterior si falla)
 * - Acceso sincrónico después de la primera carga
 */

const skillsCache = {
    data: null,
    timestamp: null,
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutos
    promise: null // Para evitar requests duplicadas simultáneamente
};

/**
 * Obtiene el mapa de habilidades (id -> nombre)
 * Utiliza caché si está disponible y fresco
 * 
 * @returns {Promise<Object>} Mapa de { skillId: skillName }
 */
export const fetchSkillsMap = async () => {
    const now = Date.now();
    
    // Si tenemos caché fresco, devolverlo inmediatamente
    if (skillsCache.data && skillsCache.timestamp && 
        now - skillsCache.timestamp < skillsCache.CACHE_DURATION) {
        return skillsCache.data;
    }
    
    // Si ya hay una petición en curso, esperar a ella
    if (skillsCache.promise) {
        return skillsCache.promise;
    }
    
    // Crear nueva petición
    skillsCache.promise = (async () => {
        try {
            const skillsResponse = await axiosInstance.get(HABILIDADES);
            const skillsMap = skillsResponse.data.reduce((acc, skill) => {
                acc[skill.id] = skill.nombre_habilidad || skill.nombre;
                return acc;
            }, {});
            
            // Actualizar caché
            skillsCache.data = skillsMap;
            skillsCache.timestamp = now;
            skillsCache.promise = null;
            
            return skillsMap;
        } catch (err) {
            console.error('Error fetching skills:', err);
            skillsCache.promise = null;
            
            // Devolver caché anterior si existe, o objeto vacío
            return skillsCache.data || {};
        }
    })();
    
    return skillsCache.promise;
};

/**
 * Expande un array de IDs de habilidades a objetos con nombre
 * 
 * @param {Array<number>} skillIds - Array de IDs de habilidades
 * @param {Object} skillsMap - Mapa de { skillId: skillName }
 * @returns {Array<Object>} Array de { id, nombre }
 */
export const expandSkills = (skillIds, skillsMap) => {
    if (!Array.isArray(skillIds)) return [];
    return skillIds.map(id => ({
        id,
        nombre: skillsMap[id] || `Habilidad ${id}`
    }));
};

/**
 * Limpia el caché manualmente (útil para refrescar datos)
 */
export const clearSkillsCache = () => {
    skillsCache.data = null;
    skillsCache.timestamp = null;
    skillsCache.promise = null;
};

/**
 * Obtiene el estado actual del caché
 */
export const getSkillsCacheStatus = () => ({
    isCached: !!skillsCache.data,
    age: skillsCache.timestamp ? Date.now() - skillsCache.timestamp : null,
    isFresh: skillsCache.data && 
             skillsCache.timestamp && 
             Date.now() - skillsCache.timestamp < skillsCache.CACHE_DURATION,
    isLoading: !!skillsCache.promise
});
