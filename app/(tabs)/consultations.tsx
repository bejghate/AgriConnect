import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Divider, Button } from 'react-native-paper';
import * as Location from 'expo-location';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { experts as expertData, Expert, ExpertSpecialty, ConsultationType } from '@/data/experts';

// Helper function to convert expert specialty to display name
const getSpecialtyDisplayName = (specialty: ExpertSpecialty): string => {
  const displayNames = {
    'veterinarian_livestock': 'Veterinarian (Livestock)',
    'veterinarian_poultry': 'Veterinarian (Poultry)',
    'agronomist_cereals': 'Agronomist (Cereals)',
    'agronomist_vegetables': 'Agronomist (Vegetables)',
    'agronomist_fruits': 'Agronomist (Fruits)',
    'soil_specialist': 'Soil Specialist',
    'pest_control': 'Pest Control Specialist',
    'agricultural_economics': 'Agricultural Economist',
    'irrigation_specialist': 'Irrigation Specialist',
    'organic_farming': 'Organic Farming Specialist',
    'livestock_nutrition': 'Livestock Nutrition Specialist',
    'agricultural_engineering': 'Agricultural Engineer'
  };

  return displayNames[specialty] || specialty;
};

// Helper function to convert availability status to display text
const getAvailabilityText = (expert: Expert): string => {
  switch (expert.availability.status) {
    case 'available_now':
      return 'Available Now';
    case 'busy':
      return 'Currently Busy';
    case 'available_soon':
      if (expert.availability.nextAvailableSlot) {
        const availableDate = new Date(expert.availability.nextAvailableSlot);
        const now = new Date();
        const diffHours = Math.round((availableDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) {
          return 'Available Soon';
        } else if (diffHours < 24) {
          return `Available in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        } else {
          return `Available on ${availableDate.toLocaleDateString()}`;
        }
      }
      return 'Available Soon';
    case 'offline':
      return 'Currently Offline';
    default:
      return 'Status Unknown';
  }
};

// Mock data for previous consultations
const previousConsultations = [
  {
    id: '101',
    expertName: 'Dr. Sarah Johnson',
    topic: 'Tomato Leaf Disease',
    date: '15 May 2025',
    status: 'Completed',
  },
  {
    id: '102',
    expertName: 'Prof. Michael Chen',
    topic: 'Cattle Vaccination Schedule',
    date: '10 May 2025',
    status: 'Completed',
  },
];

// Expert card component
const ExpertCard = ({ expert, onPress }: { expert: Expert, onPress: (expert: Expert) => void }) => (
  <TouchableOpacity onPress={() => onPress(expert)} style={styles.expertCard}>
    <Image source={expert.profileImage} style={styles.expertImage} />
    <ThemedView style={styles.expertInfo}>
      <ThemedView style={styles.expertNameContainer}>
        <ThemedText type="defaultSemiBold">{expert.name}</ThemedText>
        {expert.verified && (
          <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" style={styles.verifiedIcon} />
        )}
      </ThemedView>

      <ThemedText>{getSpecialtyDisplayName(expert.primarySpecialty)}</ThemedText>

      <ThemedView style={styles.ratingContainer}>
        <IconSymbol name="star.fill" size={16} color="#FFD700" />
        <ThemedText style={styles.ratingText}>{expert.rating} ({expert.reviewCount} reviews)</ThemedText>
      </ThemedView>

      <ThemedText style={[
        styles.availabilityText,
        expert.availability.status === 'available_now' ? styles.availableNow :
        expert.availability.status === 'busy' ? styles.busy :
        expert.availability.status === 'offline' ? styles.offline :
        styles.availableSoon
      ]}>
        {getAvailabilityText(expert)}
      </ThemedText>

      <ThemedView style={styles.badgesContainer}>
        {expert.certificationLevel === 'master' && (
          <ThemedView style={[styles.badge, styles.masterBadge]}>
            <ThemedText style={styles.badgeText}>Master</ThemedText>
          </ThemedView>
        )}
        {expert.certificationLevel === 'advanced' && (
          <ThemedView style={[styles.badge, styles.advancedBadge]}>
            <ThemedText style={styles.badgeText}>Advanced</ThemedText>
          </ThemedView>
        )}
        {expert.freeConsultationAvailable && (
          <ThemedView style={[styles.badge, styles.freeBadge]}>
            <ThemedText style={styles.badgeText}>Free Consult</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
    <IconSymbol name="chevron.right" size={20} color="#0a7ea4" style={styles.chevron} />
  </TouchableOpacity>
);

// Previous consultation item component
const ConsultationItem = ({ consultation }) => (
  <ThemedView style={styles.consultationItem}>
    <ThemedView style={styles.consultationHeader}>
      <ThemedText type="defaultSemiBold">{consultation.topic}</ThemedText>
      <ThemedText style={styles.consultationStatus}>{consultation.status}</ThemedText>
    </ThemedView>
    <ThemedText>Expert: {consultation.expertName}</ThemedText>
    <ThemedText>Date: {consultation.date}</ThemedText>
  </ThemedView>
);

export default function ConsultationsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<ExpertSpecialty[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [showOnlyFreeConsultation, setShowOnlyFreeConsultation] = useState(false);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is needed to show experts near you.');
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Location Error', 'Could not get your current location.');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getUserLocation();
  }, []);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleExpertPress = (expert: Expert) => {
    router.push(`/consultations/expert-detail?id=${expert.id}`);
  };

  const toggleSpecialtyFilter = (specialty: ExpertSpecialty) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleAvailabilityFilter = (status: string) => {
    setAvailabilityFilter(prev => prev === status ? null : status);
  };

  const resetFilters = () => {
    setSelectedSpecialties([]);
    setMaxDistance(null);
    setAvailabilityFilter(null);
    setShowOnlyVerified(false);
    setShowOnlyFreeConsultation(false);
  };

  const filteredExperts = expertData.filter(expert => {
    // Text search filter
    const matchesSearch =
      searchQuery === '' ||
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialties.some(s => getSpecialtyDisplayName(s).toLowerCase().includes(searchQuery.toLowerCase())) ||
      expert.bio.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Specialty filter
    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      expert.specialties.some(s => selectedSpecialties.includes(s));

    if (!matchesSpecialty) return false;

    // Distance filter
    let matchesDistance = true;
    if (maxDistance && userLocation && expert.location.coordinates) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        expert.location.coordinates.latitude,
        expert.location.coordinates.longitude
      );
      matchesDistance = distance <= maxDistance;
    }

    if (!matchesDistance) return false;

    // Availability filter
    const matchesAvailability =
      !availabilityFilter ||
      expert.availability.status === availabilityFilter;

    if (!matchesAvailability) return false;

    // Verified filter
    const matchesVerified = !showOnlyVerified || expert.verified;

    if (!matchesVerified) return false;

    // Free consultation filter
    const matchesFreeConsultation = !showOnlyFreeConsultation || expert.freeConsultationAvailable;

    if (!matchesFreeConsultation) return false;

    return true;
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#B8E0D2', dark: '#2A4858' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="person.2.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Expert Consultations</ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        Connect with agricultural experts for personalized advice and solutions to your farming challenges.
      </ThemedText>

      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#0a7ea4" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or specialty"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <IconSymbol
            name={showFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle"}
            size={24}
            color="#0a7ea4"
          />
        </TouchableOpacity>
      </ThemedView>

      {showFilters && (
        <ThemedView style={styles.filtersContainer}>
          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>
            Specialty
          </ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyFilters}>
            <Chip
              selected={selectedSpecialties.includes('veterinarian_livestock')}
              onPress={() => toggleSpecialtyFilter('veterinarian_livestock')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Veterinarian (Livestock)
            </Chip>
            <Chip
              selected={selectedSpecialties.includes('veterinarian_poultry')}
              onPress={() => toggleSpecialtyFilter('veterinarian_poultry')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Veterinarian (Poultry)
            </Chip>
            <Chip
              selected={selectedSpecialties.includes('agronomist_cereals')}
              onPress={() => toggleSpecialtyFilter('agronomist_cereals')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Agronomist (Cereals)
            </Chip>
            <Chip
              selected={selectedSpecialties.includes('soil_specialist')}
              onPress={() => toggleSpecialtyFilter('soil_specialist')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Soil Specialist
            </Chip>
          </ScrollView>

          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>
            Availability
          </ThemedText>

          <ThemedView style={styles.availabilityFilters}>
            <Chip
              selected={availabilityFilter === 'available_now'}
              onPress={() => toggleAvailabilityFilter('available_now')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Available Now
            </Chip>
            <Chip
              selected={availabilityFilter === 'available_soon'}
              onPress={() => toggleAvailabilityFilter('available_soon')}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Available Soon
            </Chip>
          </ThemedView>

          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>
            Distance
          </ThemedText>

          <ThemedView style={styles.distanceFilters}>
            <Chip
              selected={maxDistance === 10}
              onPress={() => setMaxDistance(10)}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
              disabled={!userLocation}
            >
              Within 10 km
            </Chip>
            <Chip
              selected={maxDistance === 50}
              onPress={() => setMaxDistance(50)}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
              disabled={!userLocation}
            >
              Within 50 km
            </Chip>
            <Chip
              selected={maxDistance === 100}
              onPress={() => setMaxDistance(100)}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
              disabled={!userLocation}
            >
              Within 100 km
            </Chip>
          </ThemedView>

          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>
            Other Filters
          </ThemedText>

          <ThemedView style={styles.otherFilters}>
            <Chip
              selected={showOnlyVerified}
              onPress={() => setShowOnlyVerified(!showOnlyVerified)}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Verified Experts Only
            </Chip>
            <Chip
              selected={showOnlyFreeConsultation}
              onPress={() => setShowOnlyFreeConsultation(!showOnlyFreeConsultation)}
              style={styles.filterChip}
              selectedColor="#0a7ea4"
            >
              Free Consultation Available
            </Chip>
          </ThemedView>

          <Button
            mode="outlined"
            onPress={resetFilters}
            style={styles.resetButton}
          >
            Reset Filters
          </Button>

          <Divider style={styles.divider} />
        </ThemedView>
      )}

      <ThemedView style={styles.resultsHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Available Experts</ThemedText>
        <ThemedText style={styles.resultsCount}>
          {filteredExperts.length} {filteredExperts.length === 1 ? 'expert' : 'experts'} found
        </ThemedText>
      </ThemedView>

      <FlatList
        data={filteredExperts}
        renderItem={({ item }) => <ExpertCard expert={item} onPress={handleExpertPress} />}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.expertsContainer}
      />

      <ThemedText type="subtitle" style={styles.sectionTitle}>Your Previous Consultations</ThemedText>

      {previousConsultations.length > 0 ? (
        <FlatList
          data={previousConsultations}
          renderItem={({ item }) => <ConsultationItem consultation={item} />}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.consultationsContainer}
        />
      ) : (
        <ThemedView style={styles.emptyStateContainer}>
          <ThemedText>You don't have any previous consultations.</ThemedText>
        </ThemedView>
      )}

      <TouchableOpacity
        style={styles.newConsultationButton}
        onPress={() => router.push('/consultations/request-consultation')}
      >
        <IconSymbol name="plus.circle" size={20} color="white" style={styles.buttonIcon} />
        <ThemedText style={styles.newConsultationButtonText}>Request New Consultation</ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSectionTitle: {
    marginBottom: 8,
  },
  specialtyFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  availabilityFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  distanceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  otherFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  resetButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    color: '#757575',
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  expertsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  expertCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  expertImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  expertInfo: {
    flex: 1,
  },
  expertNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  availabilityText: {
    marginTop: 4,
    fontSize: 14,
  },
  availableNow: {
    color: '#4CAF50',
  },
  availableSoon: {
    color: '#FF9800',
  },
  busy: {
    color: '#F44336',
  },
  offline: {
    color: '#757575',
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  masterBadge: {
    backgroundColor: '#9C27B0',
  },
  advancedBadge: {
    backgroundColor: '#2196F3',
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: 8,
  },
  consultationsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  consultationItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  consultationStatus: {
    color: '#4CAF50',
    fontSize: 14,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 24,
  },
  newConsultationButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  newConsultationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
