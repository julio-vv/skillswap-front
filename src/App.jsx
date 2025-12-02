import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './features/Auth/AuthContext';

import StartScreen from './features/Auth/StartScreen';
import LoginPage from './features/Auth/LoginPage';
import RegisterPage from './features/Auth/RegisterPage';
import MatchesPage from './features/Matches/MatchesPage';
import ProfilePage from './features/Profile/ProfilePage';

// Componente Wrapper para rutas protegidas
const ProtectedRoute = ({ element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    // Mientras verifica la autenticación, no redirigir (evita parpadeo)
    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Cargando...
        </div>;
    }
    
    // Si no está autenticado, lo redirige a la página de login
    return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<StartScreen />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Rutas Privadas (¡Solo para usuarios logueados!) */}
                <Route path="/home" element={<ProtectedRoute element={<MatchesPage />} />} />
                <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
                <Route path="/search" element={<ProtectedRoute element={<h1>Búsqueda...</h1>} />} />
                <Route path="/notifications" element={<ProtectedRoute element={<h1>Notificaciones...</h1>} />} />


                {/* Ruta de fallback para 404 */}
                <Route path="*" element={<h1>404: Página no encontrada</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;