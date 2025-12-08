import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook reutilizable para fetch de datos con AbortController
 * Previene memory leaks, evita race conditions y maneja errores de forma consistente
 * 
 * @param {Function} fetchFn - Función async que retorna los datos. Recibe signal como parámetro
 * @param {Object} options - Opciones adicionales
 *   - onSuccess: callback cuando los datos se cargan exitosamente
 *   - onError: callback cuando hay error
 *   - initialData: valor inicial de data (default: null)
 * @returns {Object} { data, loading, error, refetch, clearError }
 */
export const useFetchData = (
  fetchFn,
  options = {}
) => {
  const { onSuccess, onError, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const controllerRef = useRef(null);
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Ejecuta el fetch y actualiza estado si el componente está montado
   */
  const executeeFetch = useCallback(async () => {
    setLoading(true);
    clearError();

    // Cancelar petición previa si sigue en vuelo
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const result = await fetchFn({ signal: controller.signal });
      
      if (!mountedRef.current) return;

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      // Ignorar errores de cancelación
      const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
      if (!isCanceled) {
        handleError(err, 'useFetchData');
        onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, clearError, handleError, onSuccess, onError]);

  /**
   * Ejecutar fetch solo al montar
   */
  useEffect(() => {
    mountedRef.current = true;
    executeeFetch();

    return () => {
      mountedRef.current = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Función para refetch manual
   */
  const refetch = useCallback(async () => {
    await executeeFetch();
  }, [executeeFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    clearError,
  };
};
