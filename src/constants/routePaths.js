// Rutas de navegación centralizadas
// filepath: c:\Proyectos\SkillSwap-front\src\constants\routePaths.js

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/home',
  PROFILE: '/profile',
  USUARIO_BY_ID: (id) => `/usuarios/${id}`,
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  FRIENDS: '/friends',
  CHAT: '/chat',
  CHAT_CONVERSACION: (id) => `/chat/${id}`,
};
