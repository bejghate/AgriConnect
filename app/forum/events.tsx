import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar, Chip, Button as PaperButton } from 'react-native-paper';
import { Image } from 'expo-image';
import * as Calendar from 'expo-calendar';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';

// Sample event types
const eventTypes = [
  { id: 'training', name: 'Formation', icon: 'graduationcap.fill', color: '#4CAF50' },
  { id: 'demo', name: 'Démonstration', icon: 'eye.fill', color: '#2196F3' },
  { id: 'fair', name: 'Foire Agricole', icon: 'cart.fill', color: '#FF9800' },
  { id: 'meeting', name: 'Rencontre', icon: 'person.2.fill', color: '#9C27B0' },
  { id: 'workshop', name: 'Atelier', icon: 'hammer.fill', color: '#F44336' },
];

// Sample events
interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  endDate?: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    profileImage?: string;
  };
  image?: string;
  isVirtual: boolean;
  virtualLink?: string;
  isFree: boolean;
  price?: string;
  capacity?: number;
  registeredCount?: number;
  isRegistered?: boolean;
}

const events: Event[] = [
  {
    id: 'event-1',
    title: 'Formation sur les techniques d\'irrigation économes en eau',
    description: 'Apprenez à mettre en place des systèmes d\'irrigation goutte-à-goutte et à optimiser votre consommation d\'eau.',
    type: 'training',
    date: '2023-09-15T09:00:00Z',
    endDate: '2023-09-15T17:00:00Z',
    location: 'Centre de formation agricole, Dakar',
    organizer: {
      id: 'org-1',
      name: 'Institut Sénégalais de Recherche Agricole',
      profileImage: 'https://via.placeholder.com/100'
    },
    image: 'https://via.placeholder.com/800x400?text=Formation+Irrigation',
    isVirtual: false,
    isFree: false,
    price: '15000 XOF',
    capacity: 30,
    registeredCount: 18
  },
  {
    id: 'event-2',
    title: 'Démonstration de matériel agricole innovant',
    description: 'Venez découvrir les dernières innovations en matière de matériel agricole adapté aux petites exploitations.',
    type: 'demo',
    date: '2023-09-20T10:00:00Z',
    endDate: '2023-09-20T16:00:00Z',
    location: 'Ferme expérimentale de Thiès',
    organizer: {
      id: 'org-2',
      name: 'Association des Fournisseurs de Matériel Agricole',
      profileImage: 'https://via.placeholder.com/100'
    },
    image: 'https://via.placeholder.com/800x400?text=Démonstration+Matériel',
    isVirtual: false,
    isFree: true,
    capacity: 100,
    registeredCount: 45
  },
  {
    id: 'event-3',
    title: 'Webinaire sur l\'agriculture régénérative',
    description: 'Découvrez comment l\'agriculture régénérative peut améliorer la santé de vos sols et augmenter vos rendements.',
    type: 'training',
    date: '2023-09-25T14:00:00Z',
    endDate: '2023-09-25T16:00:00Z',
    location: 'En ligne',
    organizer: {
      id: 'org-3',
      name: 'Réseau Agroécologie Sénégal',
      profileImage: 'https://via.placeholder.com/100'
    },
    image: 'https://via.placeholder.com/800x400?text=Webinaire+Agriculture+Régénérative',
    isVirtual: true,
    virtualLink: 'https://zoom.us/j/123456789',
    isFree: true,
    capacity: 200,
    registeredCount: 87
  },
  {
    id: 'event-4',
    title: 'Foire agricole de Dakar',
    description: 'La plus grande foire agricole du Sénégal. Venez rencontrer des producteurs, fournisseurs et experts du secteur agricole.',
    type: 'fair',
    date: '2023-10-05T08:00:00Z',
    endDate: '2023-10-07T18:00:00Z',
    location: 'Parc des expositions de Dakar',
    organizer: {
      id: 'org-4',
      name: 'Ministère de l\'Agriculture',
      profileImage: 'https://via.placeholder.com/100'
    },
    image: 'https://via.placeholder.com/800x400?text=Foire+Agricole+Dakar',
    isVirtual: false,
    isFree: false,
    price: '5000 XOF',
    capacity: 5000,
    registeredCount: 1200
  },
  {
    id: 'event-5',
    title: 'Atelier pratique sur le compostage',
    description: 'Apprenez à fabriquer votre propre compost pour fertiliser vos cultures de manière naturelle et économique.',
    type: 'workshop',
    date: '2023-09-18T13:00:00Z',
    endDate: '2023-09-18T17:00:00Z',
    location: 'Ferme pédagogique de Mbour',
    organizer: {
      id: 'org-5',
      name: 'Association des Agriculteurs Bio du Sénégal',
      profileImage: 'https://via.placeholder.com/100'
    },
    image: 'https://via.placeholder.com/800x400?text=Atelier+Compostage',
    isVirtual: false,
    isFree: true,
    capacity: 25,
    registeredCount: 22,
    isRegistered: true
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  typesContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  typeCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    width: 100,
  },
  selectedTypeCard: {
    backgroundColor: '#e8f5e9',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 12,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventTypeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  freeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  eventTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizerImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 12,
    color: '#757575',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarButton: {
    padding: 8,
    marginRight: 8,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    height: 36,
  },
  registerButtonLabel: {
    fontSize: 12,
    margin: 0,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  registeredText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 4,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default function EventsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);

  // Load events data
  useEffect(() => {
    const loadEventsData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          // Get upcoming events (next 7 days)
          const now = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(now.getDate() + 7);

          const upcoming = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= nextWeek;
          });
          setUpcomingEvents(upcoming);

          // Get registered events
          const registered = events.filter(event => event.isRegistered);
          setRegisteredEvents(registered);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading events data:', error);
        setIsLoading(false);
      }
    };

    loadEventsData();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real app, this would refresh data from an API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing events data:', error);
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterEvents(query, selectedType);
  };

  // Handle type selection
  const handleTypeSelect = (typeId: string | null) => {
    setSelectedType(typeId);
    filterEvents(searchQuery, typeId);
  };

  // Filter events based on search query and selected type
  const filterEvents = (query: string, typeId: string | null) => {
    let filtered = [...events];

    if (query.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.location.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (typeId) {
      filtered = filtered.filter(event => event.type === typeId);
    }

    setFilteredEvents(filtered);
  };

  // Add event to calendar
  const addToCalendar = async (event: Event) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== 'granted') {
        alert('Vous devez autoriser l\'accès au calendrier pour ajouter cet événement.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);

      if (!defaultCalendar) {
        alert('Aucun calendrier disponible pour ajouter cet événement.');
        return;
      }

      const eventDetails = {
        title: event.title,
        startDate: new Date(event.date),
        endDate: event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000),
        timeZone: 'Africa/Dakar',
        location: event.location,
        notes: event.description,
        alarms: [{ relativeOffset: -60 }] // Reminder 1 hour before
      };

      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      alert('Événement ajouté à votre calendrier');
    } catch (error) {
      console.error('Error adding event to calendar:', error);
      alert('Erreur lors de l\'ajout de l\'événement au calendrier');
    }
  };

  // Register for event
  const registerForEvent = (eventId: string) => {
    // In a real app, this would send a registration request to an API
    alert('Inscription à l\'événement enregistrée');
  };

  // Navigate to event details
  const navigateToEventDetails = (eventId: string) => {
    // In a real app, this would navigate to an event details screen
    alert('Navigation vers les détails de l\'événement');
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Render event type item
  const renderEventTypeItem = ({ item }: { item: typeof eventTypes[0] }) => (
    <TouchableOpacity
      style={[
        styles.typeCard,
        selectedType === item.id && styles.selectedTypeCard,
        { borderColor: item.color }
      ]}
      onPress={() => handleTypeSelect(
        selectedType === item.id ? null : item.id
      )}
    >
      <ThemedView style={[styles.typeIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedText style={styles.typeName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // Render event item
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigateToEventDetails(item.id)}
    >
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.eventImage}
        />
      )}

      <ThemedView style={styles.eventContent}>
        <ThemedView style={styles.eventHeader}>
          <ThemedView style={[styles.eventTypeBadge, {
            backgroundColor: eventTypes.find(t => t.id === item.type)?.color || '#4CAF50'
          }]}>
            <ThemedText style={styles.eventTypeBadgeText}>
              {eventTypes.find(t => t.id === item.type)?.name || 'Événement'}
            </ThemedText>
          </ThemedView>

          {item.isFree ? (
            <ThemedView style={styles.freeBadge}>
              <ThemedText style={styles.freeBadgeText}>Gratuit</ThemedText>
            </ThemedView>
          ) : (
            <ThemedText style={styles.priceText}>{item.price}</ThemedText>
          )}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.eventTitle}>
          {item.title}
        </ThemedText>

        <ThemedText style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <ThemedView style={styles.eventDetails}>
          <ThemedView style={styles.eventDetailItem}>
            <IconSymbol name="calendar" size={16} color="#757575" />
            <ThemedText style={styles.eventDetailText}>
              {new Date(item.date).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.eventDetailItem}>
            <IconSymbol name="clock.fill" size={16} color="#757575" />
            <ThemedText style={styles.eventDetailText}>
              {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.eventDetailItem}>
            <IconSymbol name={item.isVirtual ? 'video.fill' : 'mappin.fill'} size={16} color="#757575" />
            <ThemedText style={styles.eventDetailText} numberOfLines={1}>
              {item.location}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.eventFooter}>
          <ThemedView style={styles.organizerContainer}>
            <Image
              source={{ uri: item.organizer.profileImage || 'https://via.placeholder.com/40' }}
              style={styles.organizerImage}
            />
            <ThemedText style={styles.organizerName} numberOfLines={1}>
              {item.organizer.name}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.eventActions}>
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => addToCalendar(item)}
            >
              <IconSymbol name="calendar.badge.plus" size={20} color="#4CAF50" />
            </TouchableOpacity>

            {!item.isRegistered && (
              <PaperButton
                mode="contained"
                onPress={() => registerForEvent(item.id)}
                style={styles.registerButton}
                labelStyle={styles.registerButtonLabel}
              >
                S'inscrire
              </PaperButton>
            )}

            {item.isRegistered && (
              <ThemedView style={styles.registeredBadge}>
                <IconSymbol name="checkmark.circle.fill" size={16} color="white" />
                <ThemedText style={styles.registeredText}>Inscrit</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement des événements...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <ThemedText type="title" style={styles.headerTitle}>
          Événements & Formations
        </ThemedText>

        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Searchbar
          placeholder="Rechercher des événements..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Types d'événements
        </ThemedText>

        <FlatList
          data={eventTypes}
          renderItem={renderEventTypeItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typesContainer}
        />

        {registeredEvents.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Vos inscriptions
            </ThemedText>

            <FlatList
              data={registeredEvents}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {upcomingEvents.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              À venir cette semaine
            </ThemedText>

            <FlatList
              data={upcomingEvents}
              renderItem={renderEventItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Tous les événements
          {selectedType && ` - ${eventTypes.find(t => t.id === selectedType)?.name}`}
        </ThemedText>

        {filteredEvents.length > 0 ? (
          <FlatList
            data={filteredEvents}
            renderItem={renderEventItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="calendar.badge.exclamationmark" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucun événement trouvé
            </ThemedText>
            {searchQuery && (
              <ThemedText style={styles.emptySubtext}>
                Essayez de modifier votre recherche
              </ThemedText>
            )}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}
