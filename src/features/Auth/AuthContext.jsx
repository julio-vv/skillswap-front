import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const AuthContext = createContext(null);

// Función auxiliar para obtener el usuario desde localStorage de forma segura
const getStoredUser = () => {
    try {
        const userJson = localStorage.getItem('skillswap_user');
        if (!userJson || userJson === 'undefined') return null;
        return JSON.parse(userJson);
    } catch (error) {
        console.error("Error al parsear el usuario desde localStorage:", error);
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    // ESTADO PARA ALMACENAR LOS DATOS DEL USUARIO (incluyendo el ID)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Para evitar parpadeo en la carga inicial

    useEffect(() => {
        const token = localStorage.getItem('skillswap_token');
        const storedUser = getStoredUser(); // Intenta cargar el objeto de usuario

        // Si hay token y usuario, asumimos que está autenticado
        // El interceptor de axios se encargará de limpiar si el token es inválido
        if (token) {
            setIsAuthenticated(true);
            setUser(storedUser); // Establece los datos del usuario (puede ser null si no se guardó)
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        
        setIsLoading(false); // Terminó de verificar
    }, []);

    // FUNCIÓN login mejorada: obtiene automáticamente los datos del usuario
    const login = async (token) => {
        localStorage.setItem('skillswap_token', token);
        setIsAuthenticated(true);

        try {
            // Obtener datos del usuario inmediatamente después del login
            const response = await axiosInstance.get('auth/user/');
            const userData = response.data;
            localStorage.setItem('skillswap_user', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            // Mantener autenticación pero sin datos de usuario
            // El usuario puede cargarlos más tarde en su perfil
            setUser(null);
            localStorage.removeItem('skillswap_user');
        }
    };

    // FUNCIÓN logout para limpiar los datos del usuario
    const logout = () => {
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user'); // Elimina los datos del usuario

        setIsAuthenticated(false);
        setUser(null);
    };

    // VALOR DEL CONTEXTO: EXPONER 'user' e 'isLoading'
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);