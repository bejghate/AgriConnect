import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '@/store/useAppStore';
import { CACHE_CONFIG } from '@/constants/Config';

interface CacheOptions {
  enabled: boolean;
  expiryTime: number; // en millisecondes
  key: string;
}

interface FetchOptions {
  cache?: CacheOptions;
  dependencies?: any[];
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  skipInitialFetch?: boolean;
}

interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  clearCache: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook personnalisé pour gérer le chargement des données avec mise en cache
 * @param fetchFunction - Fonction asynchrone qui récupère les données
 * @param options - Options de configuration
 */
export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: FetchOptions = {}
): FetchResult<T> {
  const {
    cache = { enabled: false, expiryTime: CACHE_CONFIG.DEFAULT_CACHE_TIME, key: '' },
    dependencies = [],
    retryCount = 2,
    retryDelay = 1000,
    onSuccess,
    onError,
    skipInitialFetch = false,
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { isOnline } = useAppStore();
  const retryCountRef = useRef(0);
  const isMounted = useRef(true);
  
  // Fonction pour récupérer les données du cache
  const getFromCache = useCallback(async (): Promise<{ data: T | null; timestamp: number } | null> => {
    if (!cache.enabled || !cache.key) return null;
    
    try {
      const cachedData = await AsyncStorage.getItem(`data_cache_${cache.key}`);
      if (!cachedData) return null;
      
      return JSON.parse(cachedData);
    } catch (err) {
      console.error('Erreur lors de la récupération des données du cache:', err);
      return null;
    }
  }, [cache.enabled, cache.key]);
  
  // Fonction pour sauvegarder les données dans le cache
  const saveToCache = useCallback(async (data: T): Promise<void> => {
    if (!cache.enabled || !cache.key) return;
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(`data_cache_${cache.key}`, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des données dans le cache:', err);
    }
  }, [cache.enabled, cache.key]);
  
  // Fonction pour effacer le cache
  const clearCache = useCallback(async (): Promise<void> => {
    if (!cache.enabled || !cache.key) return;
    
    try {
      await AsyncStorage.removeItem(`data_cache_${cache.key}`);
    } catch (err) {
      console.error('Erreur lors de l\'effacement du cache:', err);
    }
  }, [cache.enabled, cache.key]);
  
  // Fonction principale pour récupérer les données
  const fetchData = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier si des données en cache sont disponibles
      if (cache.enabled && cache.key) {
        const cachedData = await getFromCache();
        
        // Si des données en cache sont disponibles et valides
        if (cachedData && Date.now() - cachedData.timestamp < cache.expiryTime) {
          if (isMounted.current) {
            setData(cachedData.data);
            setLastUpdated(new Date(cachedData.timestamp));
            setLoading(false);
          }
          
          // Si l'application est hors ligne, utiliser uniquement les données en cache
          if (!isOnline) {
            return;
          }
        }
        
        // Si l'application est hors ligne et qu'il y a des données en cache (même expirées)
        if (!isOnline && cachedData) {
          if (isMounted.current) {
            setData(cachedData.data);
            setLastUpdated(new Date(cachedData.timestamp));
            setLoading(false);
          }
          return;
        }
      }
      
      // Si l'application est hors ligne et qu'il n'y a pas de données en cache
      if (!isOnline) {
        throw new Error('Vous êtes hors ligne et aucune donnée en cache n\'est disponible.');
      }
      
      // Récupérer les données fraîches
      const freshData = await fetchFunction();
      
      if (isMounted.current) {
        setData(freshData);
        setLastUpdated(new Date());
        setLoading(false);
        
        // Réinitialiser le compteur de tentatives
        retryCountRef.current = 0;
        
        // Sauvegarder les données dans le cache
        if (cache.enabled && cache.key) {
          saveToCache(freshData);
        }
        
        // Appeler le callback onSuccess si défini
        if (onSuccess) {
          onSuccess(freshData);
        }
      }
    } catch (err) {
      // Réessayer si le nombre de tentatives n'est pas dépassé
      if (retryCountRef.current < retryCount && isOnline) {
        retryCountRef.current += 1;
        
        setTimeout(() => {
          if (isMounted.current) {
            fetchData();
          }
        }, retryDelay * retryCountRef.current);
        
        return;
      }
      
      if (isMounted.current) {
        setError(err as Error);
        setLoading(false);
        
        // Appeler le callback onError si défini
        if (onError) {
          onError(err);
        }
      }
    }
  }, [
    fetchFunction,
    cache.enabled,
    cache.key,
    cache.expiryTime,
    isOnline,
    retryCount,
    retryDelay,
    getFromCache,
    saveToCache,
    onSuccess,
    onError,
  ]);
  
  // Fonction pour forcer le rechargement des données
  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);
  
  // Effet pour charger les données au montage et lorsque les dépendances changent
  useEffect(() => {
    isMounted.current = true;
    
    if (!skipInitialFetch) {
      fetchData();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, skipInitialFetch, ...dependencies]);
  
  return { data, loading, error, refetch, clearCache, lastUpdated };
}

export default useDataFetching;
