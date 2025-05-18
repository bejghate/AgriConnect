import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar } from 'react-native-paper';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { forumCategories, ForumCategory } from '@/data/forum';

// Sample regions
const regions = [
  { id: 'region-1', name: 'Dakar', icon: 'mappin.circle.fill', color: '#4CAF50' },
  { id: 'region-2', name: 'Thiès', icon: 'mappin.circle.fill', color: '#2196F3' },
  { id: 'region-3', name: 'Diourbel', icon: 'mappin.circle.fill', color: '#FF9800' },
  { id: 'region-4', name: 'Saint-Louis', icon: 'mappin.circle.fill', color: '#9C27B0' },
  { id: 'region-5', name: 'Tambacounda', icon: 'mappin.circle.fill', color: '#F44336' },
  { id: 'region-6', name: 'Kaolack', icon: 'mappin.circle.fill', color: '#607D8B' },
  { id: 'region-7', name: 'Ziguinchor', icon: 'mappin.circle.fill', color: '#795548' },
  { id: 'region-8', name: 'Fatick', icon: 'mappin.circle.fill', color: '#3F51B5' },
  { id: 'region-9', name: 'Kolda', icon: 'mappin.circle.fill', color: '#009688' },
  { id: 'region-10', name: 'Matam', icon: 'mappin.circle.fill', color: '#FFC107' },
  { id: 'region-11', name: 'Kaffrine', icon: 'mappin.circle.fill', color: '#673AB7' },
  { id: 'region-12', name: 'Kédougou', icon: 'mappin.circle.fill', color: '#E91E63' },
  { id: 'region-13', name: 'Sédhiou', icon: 'mappin.circle.fill', color: '#00BCD4' },
  { id: 'region-14', name: 'Louga', icon: 'mappin.circle.fill', color: '#8BC34A' },
];

// Sample regional categories
const regionalCategories: ForumCategory[] = [
  {
    id: 'reg-cat-1',
    name: 'Forum Dakar',
    description: 'Discussions spécifiques à la région de Dakar',
    icon: 'mappin.circle.fill',
    color: '#4CAF50',
    isRegional: true,
    region: 'Dakar',
    topicCount: 45,
    postCount: 312,
    lastPostAt: '2023-08-15T10:30:00Z',
    isActive: true
  },
  {
    id: 'reg-cat-2',
    name: 'Forum Thiès',
    description: 'Discussions spécifiques à la région de Thiès',
    icon: 'mappin.circle.fill',
    color: '#2196F3',
    isRegional: true,
    region: 'Thiès',
    topicCount: 32,
    postCount: 187,
    lastPostAt: '2023-08-14T14:20:00Z',
    isActive: true
  },
  {
    id: 'reg-cat-3',
    name: 'Forum Diourbel',
    description: 'Discussions spécifiques à la région de Diourbel',
    icon: 'mappin.circle.fill',
    color: '#FF9800',
    isRegional: true,
    region: 'Diourbel',
    topicCount: 28,
    postCount: 156,
    lastPostAt: '2023-08-13T09:15:00Z',
    isActive: true
  },
  {
    id: 'reg-cat-4',
    name: 'Forum Saint-Louis',
    description: 'Discussions spécifiques à la région de Saint-Louis',
    icon: 'mappin.circle.fill',
    color: '#9C27B0',
    isRegional: true,
    region: 'Saint-Louis',
    topicCount: 24,
    postCount: 143,
    lastPostAt: '2023-08-12T16:45:00Z',
    isActive: true
  },
  {
    id: 'reg-cat-5',
    name: 'Forum Tambacounda',
    description: 'Discussions spécifiques à la région de Tambacounda',
    icon: 'mappin.circle.fill',
    color: '#F44336',
    isRegional: true,
    region: 'Tambacounda',
    topicCount: 18,
    postCount: 97,
    lastPostAt: '2023-08-11T11:30:00Z',
    isActive: true
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
  userRegionContainer: {
    marginBottom: 16,
  },
  userRegionTitle: {
    marginBottom: 8,
  },
  userRegionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  userRegionContent: {
    flex: 1,
  },
  userRegionName: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRegionDescription: {
    fontSize: 14,
    color: '#757575',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  regionsGrid: {
    marginBottom: 16,
  },
  regionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    margin: 4,
  },
  regionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  regionName: {
    fontSize: 12,
    textAlign: 'center',
  },
  forumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  forumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  forumContent: {
    flex: 1,
  },
  forumTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  forumDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  forumStats: {
    flexDirection: 'row',
  },
  forumStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  forumStatText: {
    fontSize: 12,
    color: '#757575',
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
});

export default function RegionalForumsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRegions, setFilteredRegions] = useState(regions);
  const [popularRegionalForums, setPopularRegionalForums] = useState<ForumCategory[]>([]);
  const [userRegion, setUserRegion] = useState<string | null>(null);

  // Load regional forums data
  useEffect(() => {
    const loadRegionalForumsData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          // Get popular regional forums
          setPopularRegionalForums(regionalCategories);

          // Get user's region (if set)
          setUserRegion('Dakar'); // Example: user is from Dakar

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading regional forums data:', error);
        setIsLoading(false);
      }
    };

    loadRegionalForumsData();
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
      console.error('Error refreshing regional forums data:', error);
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = regions.filter(region =>
        region.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRegions(filtered);
    } else {
      setFilteredRegions(regions);
    }
  };

  // Navigate to category
  const navigateToCategory = (categoryId: string) => {
    router.push(`/forum/category?id=${categoryId}`);
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Render region item
  const renderRegionItem = ({ item }: { item: typeof regions[0] }) => (
    <TouchableOpacity
      style={styles.regionCard}
      onPress={() => {
        // In a real app, this would navigate to the regional forum for this region
        // For now, we'll just navigate to the first regional category
        navigateToCategory(regionalCategories[0].id);
      }}
    >
      <ThemedView style={[styles.regionIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedText style={styles.regionName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // Render regional forum item
  const renderRegionalForumItem = ({ item }: { item: ForumCategory }) => (
    <TouchableOpacity
      style={styles.forumCard}
      onPress={() => navigateToCategory(item.id)}
    >
      <ThemedView style={[styles.forumIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedView style={styles.forumContent}>
        <ThemedText type="defaultSemiBold" style={styles.forumTitle}>
          {item.name}
        </ThemedText>

        <ThemedText style={styles.forumDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <ThemedView style={styles.forumStats}>
          <ThemedView style={styles.forumStatItem}>
            <IconSymbol name="doc.text.fill" size={12} color="#757575" />
            <ThemedText style={styles.forumStatText}>
              {item.topicCount} sujets
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.forumStatItem}>
            <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
            <ThemedText style={styles.forumStatText}>
              {item.postCount} messages
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <IconSymbol name="chevron.right" size={20} color="#757575" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement des forums régionaux...</ThemedText>
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
          Forums Régionaux
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
          placeholder="Rechercher une région..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        {userRegion && (
          <ThemedView style={styles.userRegionContainer}>
            <ThemedText type="subtitle" style={styles.userRegionTitle}>
              Votre Région
            </ThemedText>

            <TouchableOpacity
              style={styles.userRegionCard}
              onPress={() => {
                // In a real app, this would navigate to the user's regional forum
                // For now, we'll just navigate to the first regional category
                navigateToCategory(regionalCategories[0].id);
              }}
            >
              <ThemedView style={styles.userRegionContent}>
                <ThemedText type="defaultSemiBold" style={styles.userRegionName}>
                  {userRegion}
                </ThemedText>

                <ThemedText style={styles.userRegionDescription}>
                  Accédez aux discussions spécifiques à votre région
                </ThemedText>
              </ThemedView>

              <IconSymbol name="chevron.right" size={20} color="#757575" />
            </TouchableOpacity>
          </ThemedView>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Toutes les Régions
        </ThemedText>

        <FlatList
          data={filteredRegions}
          renderItem={renderRegionItem}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.regionsGrid}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Forums Régionaux Populaires
        </ThemedText>

        {popularRegionalForums.length > 0 ? (
          <FlatList
            data={popularRegionalForums}
            renderItem={renderRegionalForumItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="mappin.slash" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucun forum régional populaire pour le moment
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}
