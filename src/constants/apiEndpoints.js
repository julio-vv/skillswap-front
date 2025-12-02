// Endpoints centralizados de la API
// filepath: c:\Proyectos\SkillSwap-front\src\constants\apiEndpoints.js

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
};

export const HABILIDADES = 'habilidades/';
export const TIPOS_HABILIDAD = 'tipos-habilidad/';
