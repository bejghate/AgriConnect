import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FAB, Searchbar, Chip, Divider } from 'react-native-paper';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { forumCategories, forumTopics, ForumCategory, ForumTopic } from '@/data/forum';

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
  backButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    color: '#F44336',
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
    paddingBottom: 80, // Extra padding for FAB
  },
  categoryHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  categoryStats: {
    flexDirection: 'row',
  },
  categoryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryStatText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  subcategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  subcategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  subcategoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryStatText: {
    fontSize: 12,
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filtersScrollContent: {
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsScrollContent: {
    paddingBottom: 8,
  },
  tagChip: {
    marginRight: 8,
    backgroundColor: '#e8f5e9',
  },
  topicItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  topicAuthorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicAuthor: {
    fontSize: 12,
    color: '#757575',
  },
  topicDate: {
    fontSize: 12,
    color: '#9e9e9e',
    marginLeft: 8,
  },
  topicTagsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  topicTag: {
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  topicTagText: {
    fontSize: 10,
    color: '#4CAF50',
  },
  topicStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  topicStatText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resolvedText: {
    fontSize: 10,
    color: 'white',
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 4,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [subcategories, setSubcategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filters for topics
  const filters = [
    { id: 'popular', label: 'Populaires', icon: 'flame.fill' },
    { id: 'recent', label: 'Récents', icon: 'clock.fill' },
    { id: 'unanswered', label: 'Sans réponse', icon: 'questionmark.circle.fill' },
    { id: 'solved', label: 'Résolus', icon: 'checkmark.circle.fill' },
  ];

  // Get all unique tags from topics
  const allTags = Array.from(new Set(
    topics.flatMap(topic => topic.tags)
  )).sort();

  // Load category data
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          // Find the category
          const foundCategory = forumCategories.find(cat => cat.id === id);

          if (foundCategory) {
            setCategory(foundCategory);

            // Find subcategories
            const foundSubcategories = forumCategories.filter(cat => cat.parentId === id);
            setSubcategories(foundSubcategories);

            // Find topics in this category
            const foundTopics = forumTopics.filter(topic => topic.categoryId === id);
            setTopics(foundTopics);
          }

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading category data:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      loadCategoryData();
    }
  }, [id]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real app, this would refresh data from an API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing category data:', error);
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(searchQuery.trim())}&categoryId=${id}`);
    }
  };

  // Navigate to topic
  const navigateToTopic = (topicId: string) => {
    router.push(`/forum/topic?id=${topicId}`);
  };

  // Navigate to create topic
  const navigateToCreateTopic = () => {
    router.push(`/forum/create-topic?categoryId=${id}`);
  };

  // Navigate back
  const navigateBack = () => {
    router.back();
  };

  // Filter topics
  const getFilteredTopics = () => {
    let filtered = [...topics];

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(topic => topic.tags.includes(selectedTag));
    }

    // Apply selected filter
    if (selectedFilter === 'popular') {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    } else if (selectedFilter === 'recent') {
      filtered.sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime());
    } else if (selectedFilter === 'unanswered') {
      filtered = filtered.filter(topic => topic.replyCount === 0);
    } else if (selectedFilter === 'solved') {
      filtered = filtered.filter(topic => topic.isResolved);
    }

    return filtered;
  };

  // Render subcategory item
  const renderSubcategoryItem = ({ item }: { item: ForumCategory }) => (
    <TouchableOpacity
      style={styles.subcategoryCard}
      onPress={() => router.push(`/forum/category?id=${item.id}`)}
    >
      <ThemedView style={[styles.subcategoryIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={20} color="white" />
      </ThemedView>

      <ThemedView style={styles.subcategoryContent}>
        <ThemedText type="defaultSemiBold" style={styles.subcategoryTitle}>
          {item.name}
        </ThemedText>

        <ThemedView style={styles.subcategoryStats}>
          <ThemedText style={styles.subcategoryStatText}>
            {item.topicCount} sujets • {item.postCount} messages
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <IconSymbol name="chevron.right" size={16} color="#757575" />
    </TouchableOpacity>
  );

  // Render topic item
  const renderTopicItem = ({ item }: { item: ForumTopic }) => (
    <TouchableOpacity
      style={styles.topicItem}
      onPress={() => navigateToTopic(item.id)}
    >
      <Image
        source={{ uri: item.author.profileImage || 'https://via.placeholder.com/40' }}
        style={styles.topicAuthorImage}
      />

      <ThemedView style={styles.topicContent}>
        <ThemedText type="defaultSemiBold" style={styles.topicTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>

        <ThemedView style={styles.topicMeta}>
          <ThemedText style={styles.topicAuthor}>
            {item.author.firstName} {item.author.lastName}
          </ThemedText>

          <ThemedText style={styles.topicDate}>
            {new Date(item.lastPostAt).toLocaleDateString()}
          </ThemedText>
        </ThemedView>

        {item.tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topicTagsContainer}
          >
            {item.tags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.topicTag}
                onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                <ThemedText style={styles.topicTagText}>#{tag}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ThemedView style={styles.topicStats}>
          <ThemedView style={styles.topicStatItem}>
            <IconSymbol name="eye.fill" size={12} color="#757575" />
            <ThemedText style={styles.topicStatText}>
              {item.viewCount}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.topicStatItem}>
            <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
            <ThemedText style={styles.topicStatText}>
              {item.replyCount}
            </ThemedText>
          </ThemedView>

          {item.isResolved && (
            <ThemedView style={styles.resolvedBadge}>
              <IconSymbol name="checkmark.circle.fill" size={12} color="white" />
              <ThemedText style={styles.resolvedText}>Résolu</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement de la catégorie...</ThemedText>
      </ThemedView>
    );
  }

  if (!category) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>Catégorie non trouvée</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Retour au forum</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const filteredTopics = getFilteredTopics();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <ThemedText type="title" numberOfLines={1} style={styles.headerTitle}>
          {category.name}
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
        <ThemedView style={styles.categoryHeader}>
          <ThemedView style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <IconSymbol name={category.icon} size={24} color="white" />
          </ThemedView>

          <ThemedView style={styles.categoryInfo}>
            <ThemedText type="subtitle" style={styles.categoryTitle}>
              {category.name}
            </ThemedText>

            <ThemedText style={styles.categoryDescription}>
              {category.description}
            </ThemedText>

            <ThemedView style={styles.categoryStats}>
              <ThemedView style={styles.categoryStatItem}>
                <IconSymbol name="doc.text.fill" size={12} color="#757575" />
                <ThemedText style={styles.categoryStatText}>
                  {category.topicCount} sujets
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.categoryStatItem}>
                <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
                <ThemedText style={styles.categoryStatText}>
                  {category.postCount} messages
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <Searchbar
          placeholder="Rechercher dans cette catégorie..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />

        {subcategories.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Sous-catégories
            </ThemedText>

            <FlatList
              data={subcategories}
              renderItem={renderSubcategoryItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />

            <Divider style={styles.divider} />
          </>
        )}

        <ThemedView style={styles.filterContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sujets
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            {filters.map(filter => (
              <Chip
                key={filter.id}
                selected={selectedFilter === filter.id}
                onPress={() => setSelectedFilter(
                  selectedFilter === filter.id ? null : filter.id
                )}
                style={styles.filterChip}
                icon={() => (
                  <IconSymbol
                    name={filter.icon}
                    size={16}
                    color={selectedFilter === filter.id ? 'white' : '#4CAF50'}
                  />
                )}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </ThemedView>

        {allTags.length > 0 && (
          <ThemedView style={styles.tagsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScrollContent}
            >
              {allTags.map(tag => (
                <Chip
                  key={tag}
                  selected={selectedTag === tag}
                  onPress={() => setSelectedTag(
                    selectedTag === tag ? null : tag
                  )}
                  style={styles.tagChip}
                >
                  #{tag}
                </Chip>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {filteredTopics.length > 0 ? (
          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucun sujet dans cette catégorie
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Soyez le premier à créer un sujet !
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToCreateTopic}
        color="white"
      />
    </ThemedView>
  );
}
