import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { FAB, Searchbar, Chip } from 'react-native-paper';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
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
    paddingBottom: 80, // Extra padding for FAB
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickLinkButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  quickLinkText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  personalLinksContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  personalLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  personalLinkText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#4CAF50',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
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
  filterContainer: {
    marginTop: 16,
  },
  filtersScrollContent: {
    paddingBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
    color: '#757575',
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

export default function ForumScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [featuredTopics, setFeaturedTopics] = useState<ForumTopic[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Filters for topics
  const filters = [
    { id: 'popular', label: 'Populaires', icon: 'flame.fill' },
    { id: 'recent', label: 'Récents', icon: 'clock.fill' },
    { id: 'unanswered', label: 'Sans réponse', icon: 'questionmark.circle.fill' },
    { id: 'solved', label: 'Résolus', icon: 'checkmark.circle.fill' },
  ];

  // Load forum data
  useEffect(() => {
    const loadForumData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          setCategories(forumCategories);

          // Get featured topics (pinned)
          const featured = forumTopics.filter(topic => topic.isPinned);
          setFeaturedTopics(featured);

          // Get recent topics
          const recent = [...forumTopics]
            .sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime())
            .slice(0, 5);
          setRecentTopics(recent);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading forum data:', error);
        setIsLoading(false);
      }
    };

    loadForumData();
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
      console.error('Error refreshing forum data:', error);
      setRefreshing(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Navigate to category
  const navigateToCategory = (categoryId: string) => {
    router.push(`/forum/category?id=${categoryId}`);
  };

  // Navigate to topic
  const navigateToTopic = (topicId: string) => {
    router.push(`/forum/topic?id=${topicId}`);
  };

  // Navigate to create topic
  const navigateToCreateTopic = () => {
    router.push('/forum/create-topic');
  };

  // Navigate to regional forums
  const navigateToRegionalForums = () => {
    router.push('/forum/regional');
  };

  // Navigate to best practices
  const navigateToBestPractices = () => {
    router.push('/forum/best-practices');
  };

  // Navigate to events and trainings
  const navigateToEvents = () => {
    router.push('/forum/events');
  };

  // Navigate to my topics
  const navigateToMyTopics = () => {
    router.push('/forum/my-topics');
  };

  // Navigate to my subscriptions
  const navigateToMySubscriptions = () => {
    router.push('/forum/my-subscriptions');
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: ForumCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigateToCategory(item.id)}
    >
      <ThemedView style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedView style={styles.categoryContent}>
        <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
          {item.name}
        </ThemedText>

        <ThemedText style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <ThemedView style={styles.categoryStats}>
          <ThemedView style={styles.categoryStatItem}>
            <IconSymbol name="doc.text.fill" size={12} color="#757575" />
            <ThemedText style={styles.categoryStatText}>
              {item.topicCount} sujets
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.categoryStatItem}>
            <IconSymbol name="bubble.left.fill" size={12} color="#757575" />
            <ThemedText style={styles.categoryStatText}>
              {item.postCount} messages
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <IconSymbol name="chevron.right" size={20} color="#757575" />
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
        <ThemedText style={styles.loadingText}>Chargement du forum...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Forum Communautaire</ThemedText>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Image
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
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
          placeholder="Rechercher dans le forum..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
        />

        <ThemedView style={styles.quickLinksContainer}>
          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={navigateToRegionalForums}
          >
            <IconSymbol name="map.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.quickLinkText}>Forums Régionaux</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={navigateToBestPractices}
          >
            <IconSymbol name="star.fill" size={24} color="#FF9800" />
            <ThemedText style={styles.quickLinkText}>Bonnes Pratiques</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={navigateToEvents}
          >
            <IconSymbol name="calendar.badge.plus" size={24} color="#2196F3" />
            <ThemedText style={styles.quickLinkText}>Événements</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.personalLinksContainer}>
          <TouchableOpacity
            style={styles.personalLinkButton}
            onPress={navigateToMyTopics}
          >
            <IconSymbol name="doc.text.fill" size={16} color="#4CAF50" />
            <ThemedText style={styles.personalLinkText}>Mes Sujets</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.personalLinkButton}
            onPress={navigateToMySubscriptions}
          >
            <IconSymbol name="bell.fill" size={16} color="#4CAF50" />
            <ThemedText style={styles.personalLinkText}>Mes Abonnements</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Catégories
        </ThemedText>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Sujets à la Une
        </ThemedText>

        {featuredTopics.length > 0 ? (
          <FlatList
            data={featuredTopics}
            renderItem={renderTopicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucun sujet à la une pour le moment
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.filterContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Discussions Récentes
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

        {recentTopics.length > 0 ? (
          <FlatList
            data={recentTopics}
            renderItem={renderTopicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={48} color="#e0e0e0" />
            <ThemedText style={styles.emptyText}>
              Aucune discussion récente
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
