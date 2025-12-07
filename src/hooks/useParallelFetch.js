import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook reutilizable para fetch de múltiples endpoints en paralelo
 * Evita cascadas de peticiones y reduce el tiempo total de carga
 * 
 * @param {Array<{key: string, fn: Function}>} fetchFns - Array con objetos de {key, fn}
 *   - key: identificador único para cada petición
 *   - fn: función async que retorna los datos. Recibe signal como parámetro
 * @param {Array} dependencies - Dependencias del useEffect
 * @param {Object} options - Opciones adicionales
 *   - onSuccess: callback cuando todas las peticiones se cargan exitosamente
 *   - onError: callback cuando hay error en alguna petición
 * @returns {Object} { data, loading, error, refetch, clearError }
 *   - data: objeto con claves según los keys definidos
 *   - loading: boolean indicando si alguna petición está en progreso
 *   - error: string con error si lo hay
 */
export const useParallelFetch = (
  fetchFns = [],
  dependencies = [],
  options = {}
) => {
  const { onSuccess, onError } = options;
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const controllersRef = useRef({});
  const { error, handleError, clearError } = useErrorHandler();

  /**
   * Ejecuta todas las peticiones en paralelo
   */
  const executeFetch = useCallback(async () => {
    setLoading(true);
    clearError();

    // Cancelar peticiones previas si siguen en vuelo
    Object.values(controllersRef.current).forEach(controller => {
      if (controller) controller.abort();
    });
    controllersRef.current = {};

    try {
      // Crear promesas para todas las peticiones
      const promises = fetchFns.map(async ({ key, fn }) => {
        const controller = new AbortController();
        controllersRef.current[key] = controller;

        try {
          const result = await fn({ signal: controller.signal });
          return { key, result, error: null };
        } catch (err) {
          const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
          return { key, result: null, error: isCanceled ? null : err };
        }
      });

      // Esperar a que todas se completen (Promise.all es más rápido que Promise.allSettled para casos exitosos)
      const results = await Promise.allSettled(promises);

      if (!mountedRef.current) return;

      // Procesar resultados
      const newData = {};
      let hasError = false;
      let errorMessage = null;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, result: fetchResult, error: fetchError } = result.value;
          newData[key] = fetchResult;
          if (fetchError) {
            hasError = true;
            errorMessage = fetchError.message || 'Error al cargar datos';
          }
        } else {
          hasError = true;
          errorMessage = result.reason?.message || 'Error desconocido';
        }
      });

      setData(newData);
      
      if (hasError) {
        handleError(new Error(errorMessage), 'useParallelFetch');
        onError?.(errorMessage);
      } else {
        onSuccess?.(newData);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      handleError(err, 'useParallelFetch');
      onError?.(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFns, onSuccess, onError, handleError, clearError]);

  // Ejecutar fetch cuando las dependencias cambien
  useEffect(() => {
    mountedRef.current = true;
    executeFetch();

    return () => {
      mountedRef.current = false;
      // Cancelar todas las peticiones al desmontar
      Object.values(controllersRef.current).forEach(controller => {
        if (controller) controller.abort();
      });
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    executeFetch();
  }, [executeFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    clearError,
  };
};
