import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Chip, Divider, List, RadioButton, TextInput } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LocationMap } from '@/components/LocationMap';
import { useLocation } from '@/hooks/useLocation';
import LocationService, { Coordinates } from '@/services/LocationService';
import { COLORS } from '@/constants/Theme';
import api from '@/utils/api';

// Types pour les vendeurs et experts à proximité
interface NearbySeller {
  id: string;
  username: string;
  fullName: string;
  profileImage?: string;
  location: {
    region: string;
    coordinates: Coordinates;
  };
  distance: number;
}

interface NearbyExpert {
  id: string;
  username: string;
  fullName: string;
  primaryUserType: string;
  profileImage?: string;
  location: {
    region: string;
    coordinates: Coordinates;
  };
  distance: number;
}

export default function LocationExampleScreen() {
  const router = useRouter();
  const { location, address, region, loading, error, getCurrentPosition } = useLocation();
  
  // États pour les filtres et les résultats
  const [radius, setRadius] = useState<number>(10);
  const [expertType, setExpertType] = useState<string>('all');
  const [nearbySellers, setNearbySellers] = useState<NearbySeller[]>([]);
  const [nearbyExperts, setNearbyExperts] = useState<NearbyExpert[]>([]);
  const [loadingSellers, setLoadingSellers] = useState<boolean>(false);
  const [loadingExperts, setLoadingExperts] = useState<boolean>(false);
  const [markers, setMarkers] = useState<any[]>([]);
  
  // Charger les vendeurs et experts à proximité lorsque la position change
  useEffect(() => {
    if (location && location.coords) {
      fetchNearbySellers();
      fetchNearbyExperts();
    }
  }, [location, radius, expertType]);
  
  // Mettre à jour les marqueurs lorsque les vendeurs et experts changent
  useEffect(() => {
    const newMarkers = [
      ...nearbySellers.map(seller => ({
        id: `seller-${seller.id}`,
        coordinate: seller.location.coordinates,
        title: seller.fullName,
        description: `Vendeur - ${seller.location.region}`,
        color: COLORS.categories.general,
      })),
      ...nearbyExperts.map(expert => ({
        id: `expert-${expert.id}`,
        coordinate: expert.location.coordinates,
        title: expert.fullName,
        description: `${expert.primaryUserType === 'agronomist' ? 'Agronome' : 'Vétérinaire'} - ${expert.location.region}`,
        color: expert.primaryUserType === 'agronomist' ? COLORS.categories.crops : COLORS.categories.livestock,
      }))
    ];
    
    setMarkers(newMarkers);
  }, [nearbySellers, nearbyExperts]);
  
  // Récupérer les vendeurs à proximité
  const fetchNearbySellers = async () => {
    if (!location || !location.coords) return;
    
    setLoadingSellers(true);
    
    try {
      const { latitude, longitude } = location.coords;
      
      const response = await api.get('/location/nearby-sellers', {
        params: { latitude, longitude, radius }
      });
      
      // Ajouter la distance à chaque vendeur
      const sellersWithDistance = response.data.data.sellers.map((seller: any) => ({
        ...seller,
        distance: LocationService.calculateDistance(
          latitude,
          longitude,
          seller.location.coordinates.latitude,
          seller.location.coordinates.longitude
        )
      }));
      
      // Trier par distance
      sellersWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      
      setNearbySellers(sellersWithDistance);
    } catch (error) {
      console.error('Erreur lors de la récupération des vendeurs à proximité:', error);
    } finally {
      setLoadingSellers(false);
    }
  };
  
  // Récupérer les experts à proximité
  const fetchNearbyExperts = async () => {
    if (!location || !location.coords) return;
    
    setLoadingExperts(true);
    
    try {
      const { latitude, longitude } = location.coords;
      
      const params: any = { latitude, longitude, radius };
      if (expertType !== 'all') {
        params.expertType = expertType;
      }
      
      const response = await api.get('/location/nearby-experts', { params });
      
      // Ajouter la distance à chaque expert
      const expertsWithDistance = response.data.data.experts.map((expert: any) => ({
        ...expert,
        distance: LocationService.calculateDistance(
          latitude,
          longitude,
          expert.location.coordinates.latitude,
          expert.location.coordinates.longitude
        )
      }));
      
      // Trier par distance
      expertsWithDistance.sort((a: any, b: any) => a.distance - b.distance);
      
      setNearbyExperts(expertsWithDistance);
    } catch (error) {
      console.error('Erreur lors de la récupération des experts à proximité:', error);
    } finally {
      setLoadingExperts(false);
    }
  };
  
  // Formater l'adresse
  const formatAddress = () => {
    if (!address) return 'Adresse inconnue';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Retour</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Exemple de Localisation
        </ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.description}>
          Cet écran présente un exemple d'utilisation des fonctionnalités de géolocalisation dans l'application AgriConnect.
        </ThemedText>
        
        {/* Carte avec la position de l'utilisateur */}
        <Card style={styles.card}>
          <Card.Title title="Votre Position" />
          <Card.Content>
            <ThemedView style={styles.mapContainer}>
              <LocationMap
                showUserLocation={true}
                showRadiusCircle={true}
                radiusKm={radius}
                markers={markers}
                style={styles.map}
              />
            </ThemedView>
            
            {loading ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary.main} />
                <ThemedText style={styles.loadingText}>Chargement de votre position...</ThemedText>
              </ThemedView>
            ) : error ? (
              <ThemedView style={styles.errorContainer}>
                <IconSymbol name="exclamationmark.triangle" size={20} color={COLORS.state.error} />
                <ThemedText style={styles.errorText}>{error.message}</ThemedText>
                <Button mode="contained" onPress={getCurrentPosition} style={styles.retryButton}>
                  Réessayer
                </Button>
              </ThemedView>
            ) : (
              <ThemedView style={styles.locationInfoContainer}>
                <List.Item
                  title="Coordonnées"
                  description={location ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}` : 'Inconnues'}
                  left={props => <List.Icon {...props} icon="map-marker" />}
                />
                <Divider />
                <List.Item
                  title="Adresse"
                  description={formatAddress()}
                  left={props => <List.Icon {...props} icon="home" />}
                />
                <Divider />
                <List.Item
                  title="Région"
                  description={region || 'Inconnue'}
                  left={props => <List.Icon {...props} icon="map" />}
                />
              </ThemedView>
            )}
          </Card.Content>
        </Card>
        
        {/* Filtres */}
        <Card style={styles.card}>
          <Card.Title title="Filtres de Proximité" />
          <Card.Content>
            <ThemedText style={styles.filterLabel}>Rayon de recherche: {radius} km</ThemedText>
            <View style={styles.radiusContainer}>
              <ThemedText>5 km</ThemedText>
              <TextInput
                mode="flat"
                value={radius.toString()}
                onChangeText={(value) => setRadius(parseInt(value) || 5)}
                keyboardType="number-pad"
                style={styles.radiusInput}
              />
              <ThemedText>50 km</ThemedText>
            </View>
            
            <ThemedText style={styles.filterLabel}>Type d'expert:</ThemedText>
            <RadioButton.Group onValueChange={value => setExpertType(value)} value={expertType}>
              <View style={styles.radioContainer}>
                <RadioButton.Item label="Tous" value="all" />
                <RadioButton.Item label="Agronomes" value="agronomist" />
                <RadioButton.Item label="Vétérinaires" value="veterinarian" />
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
        
        {/* Vendeurs à proximité */}
        <Card style={styles.card}>
          <Card.Title title="Vendeurs à Proximité" />
          <Card.Content>
            {loadingSellers ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary.main} />
                <ThemedText style={styles.loadingText}>Recherche de vendeurs...</ThemedText>
              </ThemedView>
            ) : nearbySellers.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                Aucun vendeur trouvé dans un rayon de {radius} km.
              </ThemedText>
            ) : (
              nearbySellers.map((seller) => (
                <View key={seller.id} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <ThemedText type="defaultSemiBold">{seller.fullName}</ThemedText>
                    <Chip icon="map-marker-distance" mode="outlined">
                      {LocationService.formatDistance(seller.distance)}
                    </Chip>
                  </View>
                  <ThemedText style={styles.itemSubtitle}>
                    Région: {seller.location.region}
                  </ThemedText>
                  <Divider style={styles.divider} />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
        
        {/* Experts à proximité */}
        <Card style={styles.card}>
          <Card.Title title="Experts à Proximité" />
          <Card.Content>
            {loadingExperts ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary.main} />
                <ThemedText style={styles.loadingText}>Recherche d'experts...</ThemedText>
              </ThemedView>
            ) : nearbyExperts.length === 0 ? (
              <ThemedText style={styles.emptyText}>
                Aucun expert trouvé dans un rayon de {radius} km.
              </ThemedText>
            ) : (
              nearbyExperts.map((expert) => (
                <View key={expert.id} style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <ThemedText type="defaultSemiBold">{expert.fullName}</ThemedText>
                    <Chip icon="map-marker-distance" mode="outlined">
                      {LocationService.formatDistance(expert.distance)}
                    </Chip>
                  </View>
                  <ThemedText style={styles.itemSubtitle}>
                    {expert.primaryUserType === 'agronomist' ? 'Agronome' : 'Vétérinaire'} - {expert.location.region}
                  </ThemedText>
                  <Divider style={styles.divider} />
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
  },
  headerTitle: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  description: {
    marginBottom: 16,
    color: '#757575',
  },
  card: {
    marginBottom: 16,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#757575',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    color: COLORS.state.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  locationInfoContainer: {
    marginTop: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  radiusInput: {
    width: 80,
    height: 40,
    textAlign: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemSubtitle: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    padding: 16,
  },
});
