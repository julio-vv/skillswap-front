import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useDebounce } from './useDebounce';
import { useErrorHandler } from './useErrorHandler';
import { USUARIOS } from '../constants/apiEndpoints';

/**
 * Hook para manejar la lógica de búsqueda de usuarios
 * 
 * @param {number} debounceDelay - Tiempo de espera para el debounce (default: 500ms)
 * @returns {Object} Estado y funciones para manejar la búsqueda
 */
export const useSearch = (debounceDelay = 500) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(10);
    
    const { error, handleError, clearError } = useErrorHandler();
    const debouncedQuery = useDebounce(searchQuery, debounceDelay);
    
    // Ref para cancelar peticiones anteriores
    const abortControllerRef = useRef(null);
    const isMountedRef = useRef(true);

    /**
     * Realiza la búsqueda de usuarios
     * Cancela peticiones anteriores si hay una nueva búsqueda
     */
    const performSearch = useCallback(async (query, page = 1) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            setTotalCount(0);
            return;
        }

        // Cancelar petición anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Crear nuevo AbortController
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        clearError();
        setHasSearched(true);

        try {
            const response = await axiosInstance.get(
                USUARIOS.buscar(query, page),
                { signal: abortControllerRef.current.signal }
            );
            
            if (!isMountedRef.current) return;
            
            // Manejar respuesta paginada o lista directa
            if (response.data.results) {
                setSearchResults(response.data.results);
                setTotalCount(response.data.count || 0);
            } else {
                const results = Array.isArray(response.data) ? response.data : [];
                setSearchResults(results);
                setTotalCount(results.length);
            }
        } catch (err) {
            // No mostrar error si fue abortado intencionalmente
            if (err.name !== 'AbortError' && isMountedRef.current) {
                handleError(err, 'búsqueda de usuarios');
                setSearchResults([]);
                setTotalCount(0);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [clearError, handleError]);

    /**
     * Maneja el cambio de página
     */
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        performSearch(searchQuery, page);
    }, [searchQuery, performSearch]);

    /**
     * Reinicia la búsqueda
     */
    const resetSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        setCurrentPage(1);
        setTotalCount(0);
        clearError();
    }, [clearError]);

    /**
     * Calcular totalPages con useMemo
     * Solo se recalcula si totalCount o pageSize cambia
     */
    const totalPages = useMemo(() => {
        return Math.ceil(totalCount / pageSize);
    }, [totalCount, pageSize]);

    // Efecto para búsqueda con debounce
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            setCurrentPage(1);
            setTotalCount(0);
            return;
        }

        setCurrentPage(1);
        performSearch(debouncedQuery, 1);
    }, [debouncedQuery, performSearch]);

    /**
     * Limpieza al desmontar
     */
    useEffect(() => {
        isMountedRef.current = true;
        
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        isLoading,
        error,
        hasSearched,
        currentPage,
        totalCount,
        pageSize,
        handlePageChange,
        resetSearch,
        totalPages
    };
};
