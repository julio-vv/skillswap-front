// Endpoints centralizados de la API

export const AUTH = {
  LOGIN: 'auth/login/',
  REGISTRATION: 'auth/registration/',
  USER: 'auth/user/',
  LOGOUT: 'auth/logout/',
};

export const USUARIOS = {
  buscar: (q, page = 1) => `usuarios/buscar/?q=${encodeURIComponent(q)}&page=${page}`,
  detalle: (id) => `usuarios/${id}/`,
  me: 'usuarios/me/',
  coincidencias: 'usuarios/coincidencias/',
  coincidenciaById: (id) => `usuarios/coincidencias/${id}/`,
};

export const CHAT = {
  conversaciones: 'chat/conversaciones/',
  mensajes: (conversacionId) => `chat/conversaciones/${conversacionId}/mensajes/`,
  enviarMensaje: (conversacionId) => `chat/conversaciones/${conversacionId}/enviar/`,
  eliminarMensaje: (conversacionId, messageId) => `chat/conversaciones/${conversacionId}/mensajes/${messageId}/`,
  marcarLeido: (conversacionId) => `chat/conversaciones/${conversacionId}/marcar_leido/`,
  stream: (conversacionId, lastId = 0) => `chat/conversaciones/${conversacionId}/stream/?last_id=${lastId}`,
};

export const NOTIFICACIONES = {
  listar: 'notificaciones/',
  actualizar: (id) => `notificaciones/${id}/`,
};

export const SOLICITUDES_MATCH = {
  listar: 'solicitudes-match/',
  crear: 'solicitudes-match/',
  aceptar: (id) => `solicitudes-match/${id}/aceptar/`,
  rechazar: (id) => `solicitudes-match/${id}/rechazar/`,
};

export const HABILIDADES = 'habilidades/';
export const TIPOS_HABILIDAD = 'tipos-habilidad/';

export const VALORACIONES = {
  listar: 'valoraciones/',
  detalle: (id) => `valoraciones/${id}/`,
};
