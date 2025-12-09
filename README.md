# 🔄 SkillSwap Frontend

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/MUI-7.3.5-007FFF.svg)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Aplicación web moderna para intercambiar habilidades y conocimientos entre usuarios. SkillSwap conecta personas que quieren aprender con quienes pueden enseñar, facilitando el intercambio mutuo de habilidades.

## ✨ Características Principales

- **Sistema de Matches Inteligente**: Encuentra usuarios con habilidades complementarias
  - Coincidencias mutuas (ambos tienen algo que enseñar y aprender)
  - Usuarios que pueden enseñarte lo que quieres aprender
  - Usuarios interesados en aprender lo que tú sabes

- **Gestión de Perfil Completa**: Crea y personaliza tu perfil con tus habilidades
  - Habilidades a enseñar y aprender organizables por prioridad (drag & drop)
  - Validación de formularios con Zod
  - Sistema de reseñas y calificaciones

- **Chat en Tiempo Real**: Comunícate con tus matches mediante SSE (Server-Sent Events)
  - Mensajes instantáneos
  - Indicadores de estado de lectura
  - Gestión de múltiples conversaciones

- **Sistema de Notificaciones**: Mantente informado sobre nuevas solicitudes y actividad

- **Búsqueda Avanzada**: Encuentra usuarios por nombre, habilidades o intereses

- **Gestión de Amigos**: Administra tus conexiones y solicitudes de amistad

## 🚀 Cómo Empezar

### Requisitos Previos

- **Node.js** 24+ (recomendado) o 20+
- **npm** o **pnpm**
- **Docker** (opcional, para contenedores)

### Instalación Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/julio-vv/skillswap-front.git
   cd skillswap-front
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_API_URL=https://api.omarmontanares.com/api/
   ```
   
   Ajusta la URL de la API según tu entorno.

4. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en `http://localhost:5173`

### Instalación con Docker

1. **Usando Docker Compose** (recomendado)
   ```bash
   docker-compose up
   ```
   
   La aplicación estará disponible en `http://localhost:3000`

2. **Usando Docker directamente**
   ```bash
   docker build -t skillswap-front .
   docker run -p 3000:5173 -e VITE_API_URL=https://api.omarmontanares.com/api/ skillswap-front
   ```

## 📦 Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Genera la build de producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta el linter ESLint
```

## 🏗️ Estructura del Proyecto

```
src/
├── api/                    # Configuración de Axios
│   ├── axiosInstance.js    # Instancia con autenticación
│   └── axiosPublic.js      # Instancia sin autenticación
├── assets/                 # Recursos estáticos
├── components/             # Componentes compartidos
│   ├── Header.jsx
│   └── UserCard.jsx
├── constants/              # Constantes globales
│   ├── apiEndpoints.js     # Endpoints de la API
│   ├── errorMessages.js    # Mensajes de error
│   └── routePaths.js       # Rutas de navegación
├── context/                # Contextos de React
│   ├── NotificationsContext.jsx
│   └── ToastContext.jsx
├── features/               # Módulos por funcionalidad
│   ├── Auth/              # Autenticación y registro
│   ├── Chat/              # Sistema de mensajería
│   ├── Friends/           # Gestión de amigos
│   ├── Matches/           # Sistema de matches
│   ├── Notifications/     # Notificaciones
│   ├── Profile/           # Perfil de usuario
│   └── Search/            # Búsqueda de usuarios
├── hooks/                  # Custom hooks
├── schemas/                # Esquemas de validación Zod
├── theme/                  # Tema personalizado de MUI
└── utils/                  # Utilidades y helpers
```

## 🛠️ Stack Tecnológico

### Core
- **React 19.2** - Biblioteca de UI con las últimas características
- **React Router 7** - Enrutamiento declarativo
- **Vite 7** - Build tool ultra-rápido

### UI/UX
- **Material-UI (MUI) 7** - Sistema de diseño completo
- **@mui/icons-material** - Iconografía
- **@emotion** - CSS-in-JS

### Gestión de Estado y Formularios
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de esquemas TypeScript-first

### Interacción Avanzada
- **@dnd-kit** - Drag and drop para ordenar habilidades
- **date-fns** - Manipulación de fechas

### HTTP y APIs
- **Axios** - Cliente HTTP con interceptores
- **EventSource Polyfill** - SSE para chat en tiempo real

## 💡 Ejemplos de Uso

### Configurar Axios con Autenticación

```javascript
import axiosInstance from './api/axiosInstance';

// Las peticiones incluyen automáticamente el token JWT
const response = await axiosInstance.get('/usuarios/coincidencias');
```

### Usar el Contexto de Autenticación

```javascript
import { useAuth } from './features/Auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Bienvenido, {user.nombre}</div>;
}
```

### Crear un Formulario con Validación

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from './schemas/profileSchema';

function ProfileForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema)
  });
  
  const onSubmit = async (data) => {
    // Manejar envío del formulario
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
    </form>
  );
}
```

### Implementar Drag & Drop para Ordenar Elementos

```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

function SortableSkills({ skills, setSkills }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSkills((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={skills}>
        {skills.map((skill) => (
          <SortableChip key={skill.id} skill={skill} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

## 🎨 Personalización del Tema

El tema se configura en `src/theme/theme.js` usando el sistema de theming de MUI v7:

```javascript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true, // Habilita CSS variables para mejor soporte
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

## 🔒 Seguridad

- Los tokens JWT se almacenan en `localStorage` con la clave `skillswap_token`
- Los interceptores de Axios manejan automáticamente la renovación de tokens expirados
- Las rutas protegidas redirigen a `/login` si no hay autenticación
- Validación del lado del cliente con Zod antes de enviar datos

## 🌐 Configuración de Producción

Para generar una build optimizada:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` con:
- Code splitting automático por módulos
- Chunks separados para MUI core y icons
- Minificación con Terser
- Tree shaking para reducir el tamaño del bundle

Para previsualizar la build:

```bash
npm run preview
```

## 📱 Soporte de Navegadores

- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Navegadores modernos con soporte ES2020+

