import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { COLORS } from '@/constants/Theme';
import { Coordinates } from '@/services/LocationService';

interface LocationMapProps {
  initialRegion?: Region;
  markers?: Array<{
    id: string;
    coordinate: Coordinates;
    title?: string;
    description?: string;
    color?: string;
    icon?: string;
  }>;
  showUserLocation?: boolean;
  showRadiusCircle?: boolean;
  radiusKm?: number;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: (coordinate: Coordinates) => void;
  style?: any;
  mapStyle?: any;
  zoomEnabled?: boolean;
  scrollEnabled?: boolean;
  rotateEnabled?: boolean;
  showsCompass?: boolean;
  showsScale?: boolean;
  showsTraffic?: boolean;
  showsBuildings?: boolean;
  showsIndoors?: boolean;
}

const DEFAULT_DELTA = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421
};

const DEFAULT_RADIUS_KM = 5;

export const LocationMap: React.FC<LocationMapProps> = ({
  initialRegion,
  markers = [],
  showUserLocation = true,
  showRadiusCircle = false,
  radiusKm = DEFAULT_RADIUS_KM,
  onRegionChange,
  onMarkerPress,
  onMapPress,
  style,
  mapStyle,
  zoomEnabled = true,
  scrollEnabled = true,
  rotateEnabled = true,
  showsCompass = true,
  showsScale = false,
  showsTraffic = false,
  showsBuildings = true,
  showsIndoors = false
}) => {
  const mapRef = useRef<MapView>(null);
  const { location, loading, error, getCurrentPosition } = useLocation();
  const [mapRegion, setMapRegion] = useState<Region | undefined>(initialRegion);
  
  // Initialiser la région de la carte avec la position de l'utilisateur
  useEffect(() => {
    if (!initialRegion && location && location.coords) {
      const { latitude, longitude } = location.coords;
      setMapRegion({
        latitude,
        longitude,
        ...DEFAULT_DELTA
      });
    }
  }, [initialRegion, location]);
  
  // Gérer le changement de région
  const handleRegionChange = (region: Region) => {
    setMapRegion(region);
    if (onRegionChange) {
      onRegionChange(region);
    }
  };
  
  // Gérer l'appui sur un marqueur
  const handleMarkerPress = (markerId: string) => {
    if (onMarkerPress) {
      onMarkerPress(markerId);
    }
  };
  
  // Gérer l'appui sur la carte
  const handleMapPress = (event: any) => {
    if (onMapPress) {
      onMapPress(event.nativeEvent.coordinate);
    }
  };
  
  // Centrer la carte sur la position de l'utilisateur
  const centerOnUserLocation = async () => {
    const currentLocation = await getCurrentPosition();
    
    if (currentLocation && currentLocation.coords && mapRef.current) {
      const { latitude, longitude } = currentLocation.coords;
      
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        ...DEFAULT_DELTA
      }, 500);
    }
  };
  
  // Afficher un indicateur de chargement si la position n'est pas encore disponible
  if (loading && !mapRegion) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <ThemedText style={styles.loadingText}>Chargement de la carte...</ThemedText>
      </ThemedView>
    );
  }
  
  // Afficher un message d'erreur si la géolocalisation a échoué
  if (error && !mapRegion) {
    return (
      <ThemedView style={[styles.container, style]}>
        <IconSymbol name="exclamationmark.triangle" size={32} color={COLORS.state.error} />
        <ThemedText style={styles.errorText}>
          Impossible d'accéder à votre position. {error.message}
        </ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={getCurrentPosition}>
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={[styles.container, style]}>
      {mapRegion && (
        <MapView
          ref={mapRef}
          style={[styles.map, mapStyle]}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          region={mapRegion}
          onRegionChangeComplete={handleRegionChange}
          onPress={handleMapPress}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={false}
          zoomEnabled={zoomEnabled}
          scrollEnabled={scrollEnabled}
          rotateEnabled={rotateEnabled}
          showsCompass={showsCompass}
          showsScale={showsScale}
          showsTraffic={showsTraffic}
          showsBuildings={showsBuildings}
          showsIndoors={showsIndoors}
        >
          {/* Cercle de rayon autour de la position de l'utilisateur */}
          {showRadiusCircle && location && location.coords && (
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              }}
              radius={radiusKm * 1000} // Conversion en mètres
              strokeWidth={1}
              strokeColor={COLORS.primary.main}
              fillColor={`${COLORS.primary.main}20`} // 20 = 12% d'opacité
            />
          )}
          
          {/* Marqueurs personnalisés */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              identifier={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              pinColor={marker.color}
              onPress={() => handleMarkerPress(marker.id)}
            />
          ))}
        </MapView>
      )}
      
      {/* Bouton pour centrer la carte sur la position de l'utilisateur */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerOnUserLocation}
      >
        <IconSymbol name="location" size={24} color={COLORS.primary.main} />
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 16,
    marginHorizontal: 32,
    textAlign: 'center',
    color: COLORS.state.error,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary.main,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
  },
});
