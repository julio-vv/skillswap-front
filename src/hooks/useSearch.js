import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useDebounce } from './useDebounce';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook para manejar la lógica de búsqueda de usuarios
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
    const [pageSize, setPageSize] = useState(10);
    
    const { error, handleError, clearError } = useErrorHandler();
    const debouncedQuery = useDebounce(searchQuery, debounceDelay);

    /**
     * Realiza la búsqueda de usuarios
     */
    const performSearch = useCallback(async (query, page = 1) => {
        if (!query || query.trim().length < 2) {
            setSearchResults([]);
            setHasSearched(false);
            setTotalCount(0);
            return;
        }

        setIsLoading(true);
        clearError();
        setHasSearched(true);

        try {
            const response = await axiosInstance.get(
                `usuarios/buscar/?q=${encodeURIComponent(query)}&page=${page}`
            );
            
            // Manejar respuesta paginada o lista directa
            if (response.data.results) {
                setSearchResults(response.data.results);
                setTotalCount(response.data.count || 0);
                
                if (response.data.results.length > 0) {
                    setPageSize(response.data.results.length);
                }
            } else {
                const results = Array.isArray(response.data) ? response.data : [];
                setSearchResults(results);
                setTotalCount(results.length);
            }
        } catch (err) {
            handleError(err, 'búsqueda de usuarios');
            setSearchResults([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
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
        totalPages: Math.ceil(totalCount / pageSize),
    };
};
