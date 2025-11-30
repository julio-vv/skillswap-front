import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Aqui se guarda la data del usuario después de iniciar sesión
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verifica si el token existe al cargar la app
        const token = localStorage.getItem('skillswap_token');
        setIsAuthenticated(!!token); 
    }, []);

    // Función para actualizar el estado después de un login/logout
    const login = (token) => {
        localStorage.setItem('skillswap_token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('skillswap_token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);