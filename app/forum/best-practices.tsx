import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar, Chip } from 'react-native-paper';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { forumTopics, ForumTopic } from '@/data/forum';

// Sample best practices categories
const bestPracticesCategories = [
  { id: 'bp-cat-1', name: 'Techniques Agricoles', icon: 'leaf.fill', color: '#4CAF50' },
  { id: 'bp-cat-2', name: 'Gestion de l\'Eau', icon: 'drop.fill', color: '#2196F3' },
  { id: 'bp-cat-3', name: 'Santé Animale', icon: 'hare.fill', color: '#FF9800' },
  { id: 'bp-cat-4', name: 'Fertilisation', icon: 'sparkles', color: '#9C27B0' },
  { id: 'bp-cat-5', name: 'Protection des Cultures', icon: 'shield.fill', color: '#F44336' },
  { id: 'bp-cat-6', name: 'Agroforesterie', icon: 'tree.fill', color: '#607D8B' },
];

// Sample best practices
const bestPractices: (ForumTopic & {
  category: string,
  beforeImage?: string,
  afterImage?: string,
  successMetrics?: string
})[] = [
  {
    id: 'bp-1',
    title: 'Technique de compostage qui a amélioré mes rendements de 20%',
    content: 'J\'ai mis en place une nouvelle technique de compostage qui a considérablement amélioré mes rendements...',
    slug: 'technique-compostage-ameliore-rendements',
    categoryId: 'cat-5',
    category: 'Fertilisation',
    author: {
      id: 'user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'Agriculteur'
    },
    createdAt: '2023-08-10T09:30:00Z',
    lastPostAt: '2023-08-16T14:20:00Z',
    viewCount: 342,
    replyCount: 28,
    isPinned: true,
    isLocked: false,
    isResolved: true,
    tags: ['compostage', 'rendement', 'innovation', 'sol'],
    status: 'published',
    beforeImage: 'https://via.placeholder.com/300x200?text=Avant',
    afterImage: 'https://via.placeholder.com/300x200?text=Après',
    successMetrics: 'Augmentation des rendements de 20%, amélioration de la structure du sol, réduction des coûts en engrais de 30%'
  },
  {
    id: 'bp-2',
    title: 'Système d\'irrigation goutte-à-goutte artisanal qui économise 40% d\'eau',
    content: 'J\'ai conçu un système d\'irrigation goutte-à-goutte avec des matériaux locaux qui m\'a permis d\'économiser beaucoup d\'eau...',
    slug: 'systeme-irrigation-goutte-a-goutte-artisanal',
    categoryId: 'cat-5',
    category: 'Gestion de l\'Eau',
    author: {
      id: 'user-3',
      firstName: 'Pierre',
      lastName: 'Martin',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      role: 'Céréalier'
    },
    createdAt: '2023-08-05T11:45:00Z',
    lastPostAt: '2023-08-15T10:30:00Z',
    viewCount: 287,
    replyCount: 19,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    tags: ['irrigation', 'eau', 'économie', 'innovation'],
    status: 'published',
    beforeImage: 'https://via.placeholder.com/300x200?text=Avant',
    afterImage: 'https://via.placeholder.com/300x200?text=Après',
    successMetrics: 'Réduction de la consommation d\'eau de 40%, diminution du temps d\'arrosage de 60%, augmentation des rendements de 15%'
  },
  {
    id: 'bp-3',
    title: 'Rotation des cultures qui a éliminé 90% des problèmes de parasites',
    content: 'En mettant en place un système de rotation des cultures sur 4 ans, j\'ai réussi à réduire considérablement les problèmes de parasites...',
    slug: 'rotation-cultures-elimination-parasites',
    categoryId: 'cat-1',
    category: 'Protection des Cultures',
    author: {
      id: 'user-5',
      firstName: 'Thomas',
      lastName: 'Leroy',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      role: 'Agriculteur Bio'
    },
    createdAt: '2023-07-28T14:20:00Z',
    lastPostAt: '2023-08-14T09:15:00Z',
    viewCount: 256,
    replyCount: 22,
    isPinned: false,
    isLocked: false,
    isResolved: true,
    tags: ['rotation', 'parasites', 'bio', 'protection'],
    status: 'published',
    beforeImage: 'https://via.placeholder.com/300x200?text=Avant',
    afterImage: 'https://via.placeholder.com/300x200?text=Après',
    successMetrics: 'Réduction des attaques de parasites de 90%, diminution des coûts en pesticides de 100%, amélioration de la biodiversité'
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
  categoriesContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    width: 100,
  },
  selectedCategoryCard: {
    backgroundColor: '#e8f5e9',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  practiceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  practiceTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  practiceAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  practiceDate: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  practiceImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageLabel: {
    fontSize: 12,
    color: '#757575',
  },
  practiceContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metricsContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  metricsTitle: {
    marginBottom: 4,
  },
  metricsText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  practiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flex: 1,
  },
  tagItem: {
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#4CAF50',
  },
  practiceStats: {
    flexDirection: 'row',
  },
  practiceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  practiceStatText: {
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
  emptySubtext: {
    marginTop: 4,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default function BestPracticesScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredPractices, setFilteredPractices] = useState(bestPractices);

  // Load best practices data
  useEffect(() => {
    const loadBestPracticesData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading best practices data:', error);
        setIsLoading(false);
      }
    };

    loadBestPracticesData();
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
      console.error('Error refreshing best practices data:', error);
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterPractices(query, selectedCategory);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    filterPractices(searchQuery, categoryId);
  };

  // Filter practices based on search query and selected category
  const filterPractices = (query: string, categoryId: string | null) => {
    let filtered = [...bestPractices];

    if (query.trim()) {
      filtered = filtered.filter(practice =>
        practice.title.toLowerCase().includes(query.toLowerCase()) ||
        practice.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (categoryId) {
      filtered = filtered.filter(practice => practice.category ===
        bestPracticesCategories.find(cat => cat.id === categoryId)?.name
      );
    }

    setFilteredPractices(filtered);
  };

  // Navigate to topic
  const navigateToTopic = (topicId: string) => {
    router.push(`/forum/topic?id=${topicId}`);
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof bestPracticesCategories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard,
        { borderColor: item.color }
      ]}
      onPress={() => handleCategorySelect(
        selectedCategory === item.id ? null : item.id
      )}
    >
      <ThemedView style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // Render best practice item
  const renderBestPracticeItem = ({ item }: { item: typeof bestPractices[0] }) => (
    <TouchableOpacity
      style={styles.practiceCard}
      onPress={() => navigateToTopic(item.id)}
    >
      <ThemedText type="subtitle" style={styles.practiceTitle}>
        {item.title}
      </ThemedText>

      <ThemedView style={styles.practiceAuthorContainer}>
        <Image
          source={{ uri: item.author.profileImage || 'https://via.placeholder.com/40' }}
          style={styles.authorImage}
        />

        <ThemedView style={styles.authorInfo}>
          <ThemedText style={styles.authorName}>
            {item.author.firstName} {item.author.lastName}
          </ThemedText>

          <ThemedText style={styles.practiceDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.categoryBadge, { backgroundColor:
          bestPracticesCategories.find(cat => cat.name === item.category)?.color || '#4CAF50'
        }]}>
          <ThemedText style={styles.categoryBadgeText}>{item.category}</ThemedText>
        </ThemedView>
      </ThemedView>

      {(item.beforeImage || item.afterImage) && (
        <ThemedView style={styles.imagesContainer}>
          {item.beforeImage && (
            <ThemedView style={styles.imageContainer}>
              <Image source={{ uri: item.beforeImage }} style={styles.practiceImage} />
              <ThemedText style={styles.imageLabel}>Avant</ThemedText>
            </ThemedView>
          )}

          {item.afterImage && (
            <ThemedView style={styles.imageContainer}>
              <Image source={{ uri: item.afterImage }} style={styles.practiceImage} />
              <ThemedText style={styles.imageLabel}>Après</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}

      <ThemedText style={styles.practiceContent} numberOfLines={3}>
        {item.content}
      </ThemedText>

      {item.successMetrics && (
        <ThemedView style={styles.metricsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.metricsTitle}>
            Résultats obtenus:
          </ThemedText>

          <ThemedText style={styles.metricsText}>
            {item.successMetrics}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.practiceFooter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
        >
          {item.tags.map(tag => (
            <ThemedView key={tag} style={styles.tagItem}>
              <ThemedText style={styles.tagText}>#{tag}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>

        <ThemedView style={styles.practiceStats}>
          <ThemedView style={styles.practiceStatItem}>
            <IconSymbol name="eye.fill" size={12} color="#757575" />
            <ThemedText style={styles.practiceStatText}>
              {item.viewCount}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.practiceStatItem}>
            <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
            <ThemedText style={styles.practiceStatText}>
              {item.replyCount}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement des bonnes pratiques...</ThemedText>
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
          Bonnes Pratiques
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
          placeholder="Rechercher des bonnes pratiques..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Catégories
        </ThemedText>

        <FlatList
          data={bestPracticesCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Bonnes Pratiques
          {selectedCategory && ` - ${bestPracticesCategories.find(cat => cat.id === selectedCategory)?.name}`}
        </ThemedText>

        {filteredPractices.length > 0 ? (
          <FlatList
            data={filteredPractices}
            renderItem={renderBestPracticeItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="star.slash" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucune bonne pratique trouvée
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
