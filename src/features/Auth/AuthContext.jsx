import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { AUTH } from '../../constants/apiEndpoints';

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
    // Estado de autenticación y datos del usuario
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMountedRef = useRef(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('skillswap_token');
            const storedUser = getStoredUser();

            // Si hay token, asumimos que está autenticado
            // El interceptor de axios se encargará de limpiar si el token es inválido
            if (token) {
                setIsAuthenticated(true);
                setUser(storedUser);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            
            setIsLoading(false);
        };

        initAuth();
    }, []);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const login = useCallback(async (token) => {
        localStorage.setItem('skillswap_token', token);
        setIsAuthenticated(true);

        try {
            // Fetch usuario tras validar token en backend
            const response = await axiosInstance.get(AUTH.USER);
            if (isMountedRef.current) {
                const userData = response.data;
                localStorage.setItem('skillswap_user', JSON.stringify(userData));
                setUser(userData);
            }
        } catch (error) {
            if (isMountedRef.current) {
                console.error('Error al obtener datos del usuario:', error);
                // Mantener autenticación pero sin datos de usuario
                // El usuario puede cargarlos más tarde en su perfil
                setUser(null);
                localStorage.removeItem('skillswap_user');
            }
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user'); // Elimina los datos del usuario

        setIsAuthenticated(false);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);