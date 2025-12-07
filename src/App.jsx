import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './features/Auth/AuthContext';
import { ROUTES } from './constants/routePaths';
const Header = lazy(() => import('./components/Header'));

// Lazy loading de componentes de rutas
const StartScreen = lazy(() => import('./features/Auth/StartScreen'));
const LoginPage = lazy(() => import('./features/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/Auth/RegisterPage'));
const MatchesPage = lazy(() => import('./features/Matches/MatchesPage'));
const ProfilePage = lazy(() => import('./features/Profile/ProfilePage'));
const SearchPage = lazy(() => import('./features/Search/SearchPage'));
const NotificationsPage = lazy(() => import('./features/Notifications/NotificationsPage'));
const FriendsPage = lazy(() => import('./features/Friends/FriendsPage'));
const ChatPage = lazy(() => import('./features/Chat/ChatPage'));

// Hook para actualizar el título de la pestaña según la ruta
function usePageTitle() {
    const { pathname } = useLocation();
    useEffect(() => {
        const titles = {
            [ROUTES.HOME]: 'SkillSwap — Matches',
            [ROUTES.SEARCH]: 'SkillSwap — Buscar Usuarios',
            [ROUTES.PROFILE]: 'SkillSwap — Mi Perfil',
            [ROUTES.NOTIFICATIONS]: 'SkillSwap — Notificaciones',
            [ROUTES.FRIENDS]: 'SkillSwap — Mis Amigos',
            [ROUTES.CHAT]: 'SkillSwap — Chat',
            [ROUTES.LOGIN]: 'SkillSwap — Iniciar Sesión',
            [ROUTES.REGISTER]: 'SkillSwap — Registro',
            [ROUTES.ROOT]: 'SkillSwap — Bienvenida',
        };
        const base = 'SkillSwap';
        if (pathname.startsWith('/usuarios/')) {
            document.title = 'SkillSwap — Perfil de Usuario';
            return;
        }
        document.title = titles[pathname] || base;
    }, [pathname]);
}

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }
    return isAuthenticated ? element : <Navigate to={ROUTES.LOGIN} />;
};

// Layout privado: Header + contenido
const PrivateLayout = () => {
    return (
        <Box>
            <Suspense fallback={<Box sx={{ p: 2 }} />}>
                <Header />
            </Suspense>
            <Box sx={{ mt: 2 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

// Componente de loading para Suspense
const PageLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
    </Box>
);

function App() {
    usePageTitle();
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Público */}
                <Route path={ROUTES.ROOT} element={<StartScreen />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                {/* Privado con layout */}
                <Route element={<PrivateLayout />}>
                    <Route path={ROUTES.HOME} element={<ProtectedRoute element={<MatchesPage />} />} />
                    <Route path={ROUTES.PROFILE} element={<ProtectedRoute element={<ProfilePage />} />} />
                    <Route path="/usuarios/:id" element={<ProtectedRoute element={<ProfilePage />} />} />
                    <Route path={ROUTES.SEARCH} element={<ProtectedRoute element={<SearchPage />} />} />
                    <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute element={<NotificationsPage />} />} />
                    <Route path={ROUTES.FRIENDS} element={<ProtectedRoute element={<FriendsPage />} />} />
                    <Route path={ROUTES.CHAT} element={<ProtectedRoute element={<ChatPage />} />} />
                    <Route path="/chat/:conversacionId" element={<ProtectedRoute element={<ChatPage />} />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<h1 style={{ padding: 24 }}>404: Página no encontrada</h1>} />
            </Routes>
        </Suspense>
    );
}

export default App;