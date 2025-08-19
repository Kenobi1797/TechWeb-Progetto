"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Cat, Comment } from './types';
import { fetchCats, fetchCatById, fetchMaptilerKey } from './ServerConnect';

interface CacheData {
  cats: Cat[];
  catsById: Record<string, Cat & { comments?: Comment[] }>;
  locations: Record<string, string | null>;
  maptilerKey: string;
  lastFetchTime: number;
}

interface CacheContext {
  // Dati
  cats: Cat[];
  getCatById: (id: string) => (Cat & { comments?: Comment[] }) | null;
  getLocation: (lat: number, lng: number) => string | null;
  maptilerKey: string;
  
  // Stati
  loading: boolean;
  error: string | null;
  
  // Azioni
  refreshCats: () => Promise<void>;
  fetchCatDetails: (id: string) => Promise<Cat & { comments?: Comment[] }>;
  setLocation: (lat: number, lng: number, location: string | null) => void;
  
  // Utilità
  getCatsWithFilter: (filter?: (cat: Cat) => boolean) => Cat[];
  getTotalCats: () => number;
}

const DataContext = createContext<CacheContext | null>(null);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minuti
const AUTO_REFRESH_INTERVAL = 30 * 1000; // 30 secondi

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: Readonly<DataProviderProps>) {
  const [cache, setCache] = useState<CacheData>({
    cats: [],
    catsById: {},
    locations: {},
    maptilerKey: '',
    lastFetchTime: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache key per geolocalizzazione
  const getLocationKey = (lat: number, lng: number) => `${lat.toFixed(6)},${lng.toFixed(6)}`;

  // Refresh cats con deduplica
  const refreshCats = useCallback(async () => {
    const now = Date.now();
    
    // Skip se richiesta recente (debounce)
    if (now - cache.lastFetchTime < 2000) {
      return;
    }

    try {
      setError(null);
      const freshCats = await fetchCats(1, 100); // Carica più gatti per avere cache robusta
      
      setCache(prev => ({
        ...prev,
        cats: freshCats,
        lastFetchTime: now
      }));
    } catch (err) {
      setError('Errore nel caricamento degli avvistamenti');
      console.error('Errore refresh cats:', err);
    } finally {
      setLoading(false);
    }
  }, [cache.lastFetchTime]);

  // Fetch dettagli gatto singolo
  const fetchCatDetails = useCallback(async (id: string) => {
    // Controlla cache prima
    if (cache.catsById[id]) {
      return cache.catsById[id];
    }

    try {
      const catWithDetails = await fetchCatById(id);
      
      setCache(prev => ({
        ...prev,
        catsById: {
          ...prev.catsById,
          [id]: catWithDetails
        }
      }));
      
      return catWithDetails;
    } catch (err) {
      console.error(`Errore fetch cat ${id}:`, err);
      throw err;
    }
  }, [cache.catsById]);

  // Funzioni di accesso ai dati
  const getCatById = useCallback((id: string) => {
    return cache.catsById[id] || null;
  }, [cache.catsById]);

  const getLocation = useCallback((lat: number, lng: number) => {
    const key = getLocationKey(lat, lng);
    return cache.locations[key] || null;
  }, [cache.locations]);

  const setLocation = useCallback((lat: number, lng: number, location: string | null) => {
    const key = getLocationKey(lat, lng);
    setCache(prev => ({
      ...prev,
      locations: {
        ...prev.locations,
        [key]: location
      }
    }));
  }, []);

  const getCatsWithFilter = useCallback((filter?: (cat: Cat) => boolean) => {
    return filter ? cache.cats.filter(filter) : cache.cats;
  }, [cache.cats]);

  const getTotalCats = useCallback(() => cache.cats.length, [cache.cats.length]);

  // Inizializzazione e setup auto-refresh
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);
        
        // Carica MapTiler key se non presente
        if (!cache.maptilerKey) {
          const key = await fetchMaptilerKey();
          if (mounted) {
            setCache(prev => ({ ...prev, maptilerKey: key }));
          }
        }

        // Carica cats se cache scaduta
        const now = Date.now();
        const cacheAge = now - cache.lastFetchTime;
        
        if (cache.cats.length === 0 || cacheAge > CACHE_DURATION) {
          await refreshCats();
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Errore inizializzazione:', err);
          setError('Errore di inizializzazione');
          setLoading(false);
        }
      }
    };

    initialize();

    // Auto-refresh interval
    const interval = setInterval(() => {
      if (mounted) {
        refreshCats();
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshCats, cache.maptilerKey, cache.cats.length, cache.lastFetchTime]);

  // Cleanup URLs quando componente unmounts
  useEffect(() => {
    return () => {
      // Cleanup blob URLs se esistono
      Object.values(cache.catsById).forEach(cat => {
        if (cat.imageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(cat.imageUrl);
        }
      });
    };
  }, [cache.catsById]);

  const contextValue = useMemo<CacheContext>(() => ({
    // Dati
    cats: cache.cats,
    getCatById,
    getLocation,
    maptilerKey: cache.maptilerKey,
    
    // Stati
    loading,
    error,
    
    // Azioni
    refreshCats,
    fetchCatDetails,
    setLocation,
    
    // Utilità
    getCatsWithFilter,
    getTotalCats
  }), [
    cache.cats,
    cache.maptilerKey,
    getCatById,
    getLocation,
    loading,
    error,
    refreshCats,
    fetchCatDetails,
    setLocation,
    getCatsWithFilter,
    getTotalCats
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// Hook personalizzato per usare il context
export function useDataCache() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataCache deve essere usato dentro DataProvider');
  }
  return context;
}

// Hook specifici per casi d'uso comuni
export function useCats(filter?: (cat: Cat) => boolean) {
  const { loading, error, getCatsWithFilter } = useDataCache();
  const filteredCats = getCatsWithFilter(filter);
  
  return {
    cats: filteredCats,
    loading,
    error,
    total: filteredCats.length
  };
}

export function useCatDetails(id: string) {
  const { getCatById, fetchCatDetails } = useDataCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cachedCat = getCatById(id);
  
  useEffect(() => {
    if (!cachedCat && id) {
      setLoading(true);
      fetchCatDetails(id)
        .then(() => setError(null))
        .catch(err => setError(err.message || 'Errore caricamento'))
        .finally(() => setLoading(false));
    }
  }, [id, cachedCat, fetchCatDetails]);
  
  return {
    cat: cachedCat,
    loading: loading && !cachedCat,
    error
  };
}

export function useGeoLocation(lat?: number, lng?: number) {
  const { getLocation, setLocation } = useDataCache();
  const [loading, setLoading] = useState(false);
  
  const location = lat && lng ? getLocation(lat, lng) : null;
  
  const fetchLocation = useCallback(async (latitude: number, longitude: number) => {
    if (getLocation(latitude, longitude)) return; // Già in cache
    
    setLoading(true);
    try {
      const { fetchLocationFromCoordsServer } = await import('./ServerConnect');
      const loc = await fetchLocationFromCoordsServer(latitude, longitude);
      setLocation(latitude, longitude, loc);
    } catch (err) {
      console.error('Errore geocoding:', err);
      setLocation(latitude, longitude, null);
    } finally {
      setLoading(false);
    }
  }, [getLocation, setLocation]);
  
  useEffect(() => {
    if (lat && lng && !location && !loading) {
      fetchLocation(lat, lng);
    }
  }, [lat, lng, location, loading, fetchLocation]);
  
  return { location, loading };
}
