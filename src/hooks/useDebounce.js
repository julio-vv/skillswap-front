import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores
 * Útil para optimizar búsquedas y entradas de usuario
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Tiempo de espera en milisegundos (default: 500ms)
 * @returns {any} Valor debounceado
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     performSearch(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Establecer un timeout para actualizar el valor debounceado
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpiar el timeout si el valor cambia antes de que se cumpla el delay
        // o si el componente se desmonta
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
