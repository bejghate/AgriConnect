import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import LocationService, { LocationData, LocationError, Coordinates } from '@/services/LocationService';
import { useAppStore } from '@/store/useAppStore';

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  distanceInterval?: number;
  timeInterval?: number;
  watchPosition?: boolean;
}

interface UseLocationResult {
  location: LocationData | null;
  address: Location.LocationGeocodedAddress | null;
  region: string | null;
  loading: boolean;
  error: LocationError | null;
  requestPermission: () => Promise<boolean>;
  getCurrentPosition: () => Promise<LocationData | null>;
  calculateDistance: (coords: Coordinates) => number;
  formatDistance: (distance: number) => string;
}

/**
 * Hook personnalisé pour gérer la géolocalisation
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<LocationError | null>(null);
  
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const { settings } = useAppStore();
  
  const defaultOptions: UseLocationOptions = {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 15000,
    distanceInterval: 100,
    timeInterval: 5000,
    watchPosition: false,
    ...options
  };
  
  // Demander les permissions et obtenir la position initiale
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        setLoading(true);
        
        const hasPermission = await LocationService.requestLocationPermissions();
        
        if (!hasPermission) {
          setError({
            code: 'PERMISSION_DENIED',
            message: 'Les permissions de localisation ont été refusées'
          });
          setLoading(false);
          return;
        }
        
        // Obtenir la position initiale
        const initialLocation = await LocationService.getCurrentPosition();
        
        if (isMounted && initialLocation) {
          setLocation(initialLocation);
          
          // Obtenir l'adresse et la région
          if (initialLocation.coords) {
            const { latitude, longitude } = initialLocation.coords;
            
            // Obtenir l'adresse
            const addresses = await LocationService.getAddressFromCoordinates(latitude, longitude);
            if (addresses && addresses.length > 0) {
              setAddress(addresses[0]);
            }
            
            // Obtenir la région
            const regionName = await LocationService.getRegionFromCoordinates(latitude, longitude);
            if (regionName) {
              setRegion(regionName);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError({
            code: 'INITIALIZATION_ERROR',
            message: err.message || 'Erreur lors de l\'initialisation de la localisation'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initialize();
    
    // Surveiller la position si demandé
    if (defaultOptions.watchPosition) {
      startWatchingPosition();
    }
    
    return () => {
      isMounted = false;
      stopWatchingPosition();
    };
  }, []);
  
  // Démarrer la surveillance de la position
  const startWatchingPosition = async () => {
    try {
      // Arrêter la surveillance précédente si elle existe
      stopWatchingPosition();
      
      // Configurer les options de surveillance
      const watchOptions: Location.LocationOptions = {
        accuracy: defaultOptions.enableHighAccuracy 
          ? Location.Accuracy.High 
          : Location.Accuracy.Balanced,
        distanceInterval: defaultOptions.distanceInterval,
        timeInterval: defaultOptions.timeInterval
      };
      
      // Démarrer la surveillance
      watchSubscription.current = await LocationService.watchPosition(
        async (newLocation) => {
          setLocation(newLocation);
          
          // Mettre à jour l'adresse et la région si nécessaire
          if (settings.locationEnabled) {
            const { latitude, longitude } = newLocation.coords;
            
            // Obtenir l'adresse
            const addresses = await LocationService.getAddressFromCoordinates(latitude, longitude);
            if (addresses && addresses.length > 0) {
              setAddress(addresses[0]);
            }
            
            // Obtenir la région
            const regionName = await LocationService.getRegionFromCoordinates(latitude, longitude);
            if (regionName) {
              setRegion(regionName);
            }
          }
        },
        (err) => {
          setError(err);
        },
        watchOptions
      );
    } catch (err: any) {
      setError({
        code: 'WATCH_POSITION_ERROR',
        message: err.message || 'Erreur lors de la surveillance de la position'
      });
    }
  };
  
  // Arrêter la surveillance de la position
  const stopWatchingPosition = () => {
    if (watchSubscription.current) {
      LocationService.stopWatchingPosition(watchSubscription.current);
      watchSubscription.current = null;
    }
  };
  
  // Demander les permissions
  const requestPermission = async (): Promise<boolean> => {
    return await LocationService.requestLocationPermissions();
  };
  
  // Obtenir la position actuelle
  const getCurrentPosition = async (): Promise<LocationData | null> => {
    setLoading(true);
    
    try {
      const currentLocation = await LocationService.getCurrentPosition();
      
      if (currentLocation) {
        setLocation(currentLocation);
        
        // Mettre à jour l'adresse et la région
        const { latitude, longitude } = currentLocation.coords;
        
        // Obtenir l'adresse
        const addresses = await LocationService.getAddressFromCoordinates(latitude, longitude);
        if (addresses && addresses.length > 0) {
          setAddress(addresses[0]);
        }
        
        // Obtenir la région
        const regionName = await LocationService.getRegionFromCoordinates(latitude, longitude);
        if (regionName) {
          setRegion(regionName);
        }
      }
      
      setLoading(false);
      return currentLocation;
    } catch (err: any) {
      setError({
        code: 'GET_CURRENT_POSITION_ERROR',
        message: err.message || 'Erreur lors de l\'obtention de la position actuelle'
      });
      setLoading(false);
      return null;
    }
  };
  
  // Calculer la distance entre la position actuelle et des coordonnées données
  const calculateDistance = (coords: Coordinates): number => {
    if (!location || !location.coords) {
      return -1;
    }
    
    return LocationService.calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      coords.latitude,
      coords.longitude
    );
  };
  
  // Formater la distance pour l'affichage
  const formatDistance = (distance: number): string => {
    return LocationService.formatDistance(distance);
  };
  
  return {
    location,
    address,
    region,
    loading,
    error,
    requestPermission,
    getCurrentPosition,
    calculateDistance,
    formatDistance
  };
}
