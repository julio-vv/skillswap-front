/**
 * Normaliza una habilidad a su nombre legible
 * @param {string|Object} hab - Habilidad que puede ser string u objeto
 * @returns {string} - Nombre legible de la habilidad
 */
export const normalizeSkillName = (hab) => {
    if (hab && typeof hab === 'object') {
        return hab.nombre_habilidad || hab.nombre || JSON.stringify(hab);
    }
    return String(hab);
};

/**
 * Filtra usuarios por tipo de coincidencia
 * @param {Array} usuarios - Array de usuarios con puede_ensenar y puede_aprender
 * @returns {Object} - Objeto con arrays mutual, teach, learn
 */
export const filterUsersByMatchType = (usuarios) => {
    const hasSkills = (arr) => Array.isArray(arr) && arr.length > 0;
    const noSkills = (arr) => !Array.isArray(arr) || arr.length === 0;

    return {
        mutual: usuarios.filter(u => hasSkills(u.puede_ensenar) && hasSkills(u.puede_aprender)),
        teach: usuarios.filter(u => hasSkills(u.puede_ensenar) && noSkills(u.puede_aprender)),
        learn: usuarios.filter(u => hasSkills(u.puede_aprender) && noSkills(u.puede_ensenar))
    };
};
