# SkillSwap Frontend

Frontend de SkillSwap construido con React + Vite y Material UI. Incluye autenticación, manejo de perfil, búsqueda de usuarios y un layout privado con protección de rutas.

> Tech principales: React 19, React Router 7, Vite 7, MUI 7, React Hook Form + Zod, Axios.

---

## ¿Qué hace el proyecto?

SkillSwap es una aplicación para conectar personas que quieren intercambiar habilidades. Este frontend:

- Muestra una pantalla de bienvenida pública.
- Permite registro e inicio de sesión con token (DRF Token Auth).
- Ofrece un área privada con Header y rutas protegidas.
- Gestiona el perfil del usuario, incluyendo subida de imagen (FormData).
- Implementa búsqueda de usuarios con paginación.
- Maneja errores con un ErrorBoundary para evitar pantallas en blanco.

Rutas principales (ver `src/App.jsx`):

- `/` (pública): bienvenida (`StartScreen`).
- `/login`, `/register` (públicas): autenticación.
- `/home` (privada): lista de “Matches” en `features/Matches/MatchesPage.jsx`.
- `/profile` (privada): perfil propio.
- `/usuarios/:id` (privada): perfil de otro usuario.
- `/search` (privada): buscador de usuarios.

---

## Cómo empezar

### Requisitos

- Node.js 18+ (recomendado 20/22/24).
- npm 9+ (o tu gestor preferido).

### Variables de entorno

Este proyecto usa Vite. Configura la URL de la API con `VITE_API_URL`.

Crea un archivo `.env.local` en la raíz:

```
VITE_API_URL=https://api.omarmontanares.com/api/
```

### Instalación (local)

```bash
npm install
npm run dev
```

- Dev server: por defecto en `http://localhost:5173` (Vite).
- Scripts disponibles:
	- `npm run dev`: entorno de desarrollo.
	- `npm run build`: build de producción.
	- `npm run preview`: previsualización del build.
	- `npm run lint`: ESLint.

---

## Ejemplos de uso

- Autenticación:
	- Inicia sesión en `/login`. Se almacena `skillswap_token` en `localStorage` y el interceptor de Axios lo incluye como `Authorization: Token <key>`.
	- Al cerrar sesión, se limpia el storage y se redirige al login si la API devuelve 401.

- Perfil y subida de imagen:
	- La subida usa `FormData` con Axios; el `Content-Type` no se fuerza para permitir el boundary correcto.
	- Los formularios usan React Hook Form + Zod para validación.

- Navegación protegida:
	- Las rutas privadas (`/home`, `/profile`, `/search`, `/usuarios/:id`) requieren sesión. Si no hay token, `ProtectedRoute` redirige a `/login`.

---

## Ayuda y soporte

- Revisa el código de rutas en `src/App.jsx` y el contexto de auth en `src/features/Auth/AuthContext.jsx` para entender el flujo.
- Los clientes de API están en `src/api/axiosInstance.js` (privado) y `src/api/axiosPublic.js` (público).

---

## Licencia

Consulta el archivo `LICENSE` si existe en el repositorio. Si no está presente, considera abrir un issue para discutir la licencia del proyecto.

