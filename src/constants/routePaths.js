// Rutas de navegación centralizadas

export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/home',
  PROFILE: '/profile',
  USUARIO_BY_ID: (id) => `/usuarios/${id}`,
  USUARIO_BY_ID_PATTERN: '/usuarios/:id', // Para definir la ruta en React Router
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',
  FRIENDS: '/friends',
  CHAT: '/chat',
  CHAT_CONVERSACION: (id) => `/chat/${id}`,
  CHAT_CONVERSACION_PATTERN: '/chat/:conversacionId', // Para definir la ruta en React Router
};
