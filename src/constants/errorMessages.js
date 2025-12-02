// Mensajes de error centralizados para reutilización y traducción
// filepath: c:\Proyectos\SkillSwap-front\src\constants\errorMessages.js

export const ERROR_MESSAGES = {
  unexpected: 'Ha ocurrido un error inesperado',
  sessionExpired: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  forbidden: 'No tienes permisos para realizar esta acción.',
  notFound: 'Recurso no encontrado.',
  server: 'Error del servidor. Intenta nuevamente más tarde.',
  network: 'Error de conexión. Verifica tu conexión a internet.',
};

// Utilidad para extraer mensaje de estructuras de error del backend
export function extractApiErrorMessage(data) {
  if (typeof data === 'string') return data;
  if (!data) return ERROR_MESSAGES.unexpected;

  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors) return Array.isArray(data.non_field_errors)
    ? data.non_field_errors.join(' ')
    : String(data.non_field_errors);

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const value = data[firstKey];
    return Array.isArray(value) ? value.join(' ') : String(value);
  }

  return ERROR_MESSAGES.unexpected;
}
