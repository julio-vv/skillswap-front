/**
 * Utilidad para renderizar habilidades en la UI
 * Centraliza la lógica de conversión de IDs a nombres
 */

/**
 * Obtiene el nombre de una habilidad desde un ID o objeto
 * 
 * @param {number|string|Object} habilidad - ID de habilidad o objeto con nombre
 * @param {Map} skillsMap - Mapa de { skillId: skillName }
 * @returns {string} Nombre de la habilidad
 */
export const getSkillName = (habilidad, skillsMap = new Map()) => {
    // Si es un objeto con propiedades de nombre
    if (habilidad && typeof habilidad === 'object') {
        return habilidad.nombre_habilidad || habilidad.nombre || String(habilidad.id);
    }
    
    // Si es un ID (número o string), buscar en mapa
    const name = skillsMap.get(String(habilidad));
    return name || String(habilidad);
};

/**
 * Prepara un array de habilidades para renderizar
 * Convierte IDs a nombres y prepara estructura para Chips
 * 
 * @param {Array} skillIds - Array de IDs de habilidades
 * @param {Map} skillsMap - Mapa de { skillId: skillName }
 * @returns {Array} Array de { id, nombre } listo para renderizar
 */
export const formatSkillsForDisplay = (skillIds, skillsMap = new Map()) => {
    if (!Array.isArray(skillIds)) return [];
    
    return skillIds.map((skillId, index) => ({
        id: typeof skillId === 'object' ? skillId.id : skillId,
        nombre: getSkillName(skillId, skillsMap),
        _displayKey: index // Para key en maps (estable en la misma búsqueda)
    }));
};

/**
 * Genera un mapa de habilidades desde array plano
 * 
 * @param {Array} skillsList - Array de objetos con id y nombre
 * @returns {Map} Mapa de { skillId: skillName }
 */
export const buildSkillsMap = (skillsList) => {
    const map = new Map();
    
    if (Array.isArray(skillsList)) {
        for (const skill of skillsList) {
            if (skill && skill.id != null) {
                map.set(String(skill.id), skill.nombre_habilidad || skill.nombre || '');
            }
        }
    }
    
    return map;
};
