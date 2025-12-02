import React, { createContext, useContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        const token = localStorage.getItem('skillswap_token');
        const storedUser = getStoredUser(); // Intenta cargar el objeto de usuario

        // LÓGICA DE useEffect 
        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser); // Establece los datos del usuario al cargar la app
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, []);

    // FUNCIÓN login para recibir y almacenar los datos del usuario
    // Asume que 'userData' es el objeto que incluye el 'id' y demás campos del perfil.
    const login = (token, userData) => {
        localStorage.setItem('skillswap_token', token);
        if (userData) {
            localStorage.setItem('skillswap_user', JSON.stringify(userData)); // Guarda el objeto de usuario en localStorage
            setUser(userData); // Actualiza el estado
        } else {
            // Evitar almacenar "undefined" como string
            localStorage.removeItem('skillswap_user');
            setUser(null);
        }

        setIsAuthenticated(true);
    };

    // FUNCIÓN logout para limpiar los datos del usuario
    const logout = () => {
        localStorage.removeItem('skillswap_token');
        localStorage.removeItem('skillswap_user'); // Elimina los datos del usuario

        setIsAuthenticated(false);
        setUser(null);
    };

    // VALOR DEL CONTEXTO: EXPONER 'user'
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);