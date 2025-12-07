// Utilidad para formatear los datos del perfil para react-hook-form

/**
 * Formatea los datos del usuario para usarlos como defaultValues en react-hook-form
 * @param {Object} userData - Datos del usuario de la API
 * @returns {Object} Datos formateados para el formulario
 */
export function formatProfileDataForForm(userData) {
    if (!userData) return null;
    return {
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        year: userData.year || 0,
        telefono: userData.telefono || '',
        habilidades_que_se_saben: (userData.habilidades_que_se_saben ?? [])
            .map(h => typeof h === 'object' ? h.id : h),
        habilidades_por_aprender: (userData.habilidades_por_aprender ?? [])
            .map(h => typeof h === 'object' ? h.id : h),
        email: userData.email || '',
        media: userData.media || '',
    };
}
