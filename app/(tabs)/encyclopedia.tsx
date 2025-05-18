import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GlobalSearchButton } from '@/components/search/GlobalSearchButton';
import { NavigationHistoryButton } from '@/components/navigation/NavigationHistoryButton';
import { useOffline } from '@/context/OfflineContext';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { useNavigationHistory } from '@/context/NavigationHistoryContext';
import { STORAGE_KEYS, getData, storeData } from '@/utils/storage';
import { encyclopediaCategories } from '@/data/encyclopedia';

// Category item component
const CategoryItem = ({ item, onPress, onDownload, isDownloading }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.categoryItem}>
    <ThemedView style={styles.categoryContent}>
      <IconSymbol size={40} name={item.icon} color="#0a7ea4" style={styles.categoryIcon} />
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.categoryDescription}>
        {item.description}
      </ThemedText>

      {/* Download button for offline use */}
      <TouchableOpacity
        style={styles.categoryDownloadButton}
        onPress={() => onDownload(item.id)}
        disabled={isDownloading === item.id}
      >
        {isDownloading === item.id ? (
          <ActivityIndicator size="small" color="#0a7ea4" />
        ) : (
          <>
            <IconSymbol name="arrow.down.circle" size={16} color="#0a7ea4" />
            <ThemedText style={styles.categoryDownloadText}>Download</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </ThemedView>
  </TouchableOpacity>
);

// Interface for article
interface Article {
  id: string;
  title: string;
  content: string;
  isDownloaded?: boolean;
}

// Featured articles data
const featuredArticles: Article[] = [
  {
    id: 'article1',
    title: 'Sustainable Farming Practices',
    content: 'Sustainable farming practices focus on producing crops and livestock while ensuring economic profitability, environmental stewardship, and social responsibility. These methods aim to meet society\'s present food needs without compromising the ability of future generations to meet their own needs.',
  },
  {
    id: 'article2',
    title: 'Seasonal Planting Guide',
    content: 'Understanding when to plant different crops is essential for successful farming. This guide provides information on optimal planting times based on seasons, climate zones, and crop varieties to maximize yield.',
  },
  {
    id: 'article3',
    title: 'Livestock Health Management',
    content: 'Proper livestock health management is crucial for productive farming operations. Learn about preventive care, disease recognition, and treatment options for various types of farm animals.',
  },
];

export default function EncyclopediaScreen() {
  const router = useRouter();
  const { isOnline, downloadForOffline, isContentAvailableOffline } = useOffline();
  const { preferences } = useAccessibilityContext();
  const { history } = useNavigationHistory();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [articles, setArticles] = useState<Article[]>(featuredArticles);
  const [downloadingArticleId, setDownloadingArticleId] = useState<string | null>(null);
  const [downloadingCategoryId, setDownloadingCategoryId] = useState<string | null>(null);

  // Check which articles are available offline
  useEffect(() => {
    const checkOfflineAvailability = async () => {
      setIsLoading(true);

      try {
        const updatedArticles = await Promise.all(
          articles.map(async (article) => {
            const isDownloaded = await isContentAvailableOffline('articles', article.id);
            return { ...article, isDownloaded };
          })
        );

        setArticles(updatedArticles);
      } catch (error) {
        console.error('Error checking offline availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOfflineAvailability();
  }, []);

  const handleCategoryPress = (category) => {
    router.push(`/encyclopedia/subcategories?categoryId=${category.id}`);
  };

  const handleDownloadArticle = async (article: Article) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to download content for offline use.',
        [{ text: 'OK' }]
      );
      return;
    }

    setDownloadingArticleId(article.id);

    try {
      const success = await downloadForOffline('articles', article.id);

      if (success) {
        // Update the article's download status
        setArticles(prevArticles =>
          prevArticles.map(a =>
            a.id === article.id ? { ...a, isDownloaded: true } : a
          )
        );

        Alert.alert(
          'Download Complete',
          `"${article.title}" is now available offline.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Download Failed',
          'There was an error downloading the article. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading article:', error);
      Alert.alert(
        'Download Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloadingArticleId(null);
    }
  };

  const handleDownloadCategory = async (categoryId: string) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to download content for offline use.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Find the category
    const category = encyclopediaCategories.find(cat => cat.id === categoryId);
    if (!category) {
      Alert.alert('Error', 'Category not found.');
      return;
    }

    // Confirm download with user
    Alert.alert(
      'Download Entire Category',
      `This will download all content in the "${category.title}" category for offline use. This may use significant storage space. Continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Download',
          onPress: async () => {
            setDownloadingCategoryId(categoryId);

            try {
              // In a real app, this would download all items in the category
              // For now, we'll simulate downloading the category metadata
              const success = await downloadForOffline('categories', categoryId);

              if (success) {
                // Simulate downloading all subcategories
                for (const subcategory of category.subcategories) {
                  await downloadForOffline('subcategories', subcategory.id);

                  // Simulate downloading all items in each subcategory
                  for (const item of subcategory.items) {
                    await downloadForOffline('encyclopedia', item.id);
                  }
                }

                Alert.alert(
                  'Download Complete',
                  `The "${category.title}" category is now available offline.`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  'Download Failed',
                  'There was an error downloading the category. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error downloading category:', error);
              Alert.alert(
                'Download Error',
                'An unexpected error occurred. Please try again later.',
                [{ text: 'OK' }]
              );
            } finally {
              setDownloadingCategoryId(null);
            }
          }
        }
      ]
    );
  };

  const navigateToOfflineContent = () => {
    router.push('/offline-content');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name="book.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title">Agricultural Encyclopedia</ThemedText>
        </ThemedView>

        <ThemedView style={styles.headerButtons}>
          <GlobalSearchButton
            style={styles.headerButton}
            size={20}
            accessibilityLabel={preferences.voiceCommands ? "Search. Say 'search' to activate" : "Search"}
          />
          <NavigationHistoryButton
            style={styles.headerButton}
            size={20}
            accessibilityLabel={preferences.voiceCommands ? "History. Say 'history' to activate" : "History"}
          />
          <TouchableOpacity
            style={styles.offlineButton}
            onPress={navigateToOfflineContent}
          >
            <IconSymbol
              name={isOnline ? "arrow.down.circle" : "arrow.down.circle.fill"}
              size={20}
              color="#0a7ea4"
            />
            <ThemedText style={styles.offlineButtonText}>
              {isOnline ? "Offline Content" : "Offline Mode"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some content may not be available.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedText style={styles.introText}>
        Explore our comprehensive agricultural knowledge base covering crops, livestock, farming techniques, and more.
      </ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>

      <FlatList
        data={encyclopediaCategories}
        renderItem={({ item }) => (
          <CategoryItem
            item={item}
            onPress={handleCategoryPress}
            onDownload={handleDownloadCategory}
            isDownloading={downloadingCategoryId}
          />
        )}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        numColumns={2}
        contentContainerStyle={styles.categoriesContainer}
      />

      <ThemedView style={styles.featuredHeader}>
        <ThemedText type="subtitle">Featured Articles</ThemedText>
        {isOnline && (
          <TouchableOpacity onPress={() => router.push('/climate-impact')}>
            <ThemedText style={styles.climateLink}>Climate Impact</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading articles...</ThemedText>
        </ThemedView>
      ) : (
        <>
          <Collapsible
            title="Sustainable Farming Practices"
            rightElement={
              downloadingArticleId === 'article1' ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
              ) : (
                <TouchableOpacity
                  onPress={() => handleDownloadArticle(articles[0])}
                  disabled={articles[0].isDownloaded}
                >
                  <IconSymbol
                    name={articles[0].isDownloaded ? "arrow.down.circle.fill" : "arrow.down.circle"}
                    size={20}
                    color="#0a7ea4"
                  />
                </TouchableOpacity>
              )
            }
          >
            <ThemedText>
              Sustainable farming practices focus on producing crops and livestock while ensuring economic profitability,
              environmental stewardship, and social responsibility. These methods aim to meet society's present food needs
              without compromising the ability of future generations to meet their own needs.
            </ThemedText>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.articleImage} />
          </Collapsible>

          <Collapsible
            title="Seasonal Planting Guide"
            rightElement={
              downloadingArticleId === 'article2' ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
              ) : (
                <TouchableOpacity
                  onPress={() => handleDownloadArticle(articles[1])}
                  disabled={articles[1].isDownloaded}
                >
                  <IconSymbol
                    name={articles[1].isDownloaded ? "arrow.down.circle.fill" : "arrow.down.circle"}
                    size={20}
                    color="#0a7ea4"
                  />
                </TouchableOpacity>
              )
            }
          >
            <ThemedText>
              Understanding when to plant different crops is essential for successful farming. This guide provides
              information on optimal planting times based on seasons, climate zones, and crop varieties to maximize yield.
            </ThemedText>
          </Collapsible>

          <Collapsible
            title="Livestock Health Management"
            rightElement={
              downloadingArticleId === 'article3' ? (
                <ActivityIndicator size="small" color="#0a7ea4" />
              ) : (
                <TouchableOpacity
                  onPress={() => handleDownloadArticle(articles[2])}
                  disabled={articles[2].isDownloaded}
                >
                  <IconSymbol
                    name={articles[2].isDownloaded ? "arrow.down.circle.fill" : "arrow.down.circle"}
                    size={20}
                    color="#0a7ea4"
                  />
                </TouchableOpacity>
              )
            }
          >
            <ThemedText>
              Proper livestock health management is crucial for productive farming operations. Learn about preventive
              care, disease recognition, and treatment options for various types of farm animals.
            </ThemedText>
          </Collapsible>
        </>
      )}

      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push('/encyclopedia/search')}
      >
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <ThemedText style={styles.searchPlaceholder}>Search the encyclopedia...</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/encyclopedia/subcategories?categoryId=livestock')}
        >
          <IconSymbol name="hare.fill" size={20} color="white" style={styles.actionButtonIcon} />
          <ThemedText style={styles.actionButtonText}>Livestock</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/encyclopedia/subcategories?categoryId=crops')}
        >
          <IconSymbol name="leaf.fill" size={20} color="white" style={styles.actionButtonIcon} />
          <ThemedText style={styles.actionButtonText}>Crops</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/encyclopedia/subcategories?categoryId=soil')}
        >
          <IconSymbol name="square.3.layers.3d.down.right" size={20} color="white" style={styles.actionButtonIcon} />
          <ThemedText style={styles.actionButtonText}>Soil</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.quickAccessContainer}>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => router.push('/encyclopedia/favorites')}
        >
          <IconSymbol name="star.fill" size={24} color="#FFC107" style={styles.quickAccessIcon} />
          <ThemedText style={styles.quickAccessText}>Favorites</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => router.push('/encyclopedia/search')}
        >
          <IconSymbol name="magnifyingglass" size={24} color="#0a7ea4" style={styles.quickAccessIcon} />
          <ThemedText style={styles.quickAccessText}>Advanced Search</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.toolsContainer}>
        <ThemedText type="subtitle" style={styles.toolsTitle}>Diagnostic Tools</ThemedText>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push('/encyclopedia/symptom-diagnostic?plantType=tomato')}
        >
          <ThemedView style={styles.toolCardContent}>
            <IconSymbol name="leaf.fill" size={32} color="#4CAF50" style={styles.toolCardIcon} />
            <ThemedView style={styles.toolCardTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.toolCardTitle}>
                Plant Disease Diagnostic
              </ThemedText>
              <ThemedText style={styles.toolCardDescription}>
                Identify diseases by symptoms and get treatment recommendations
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolCard}
          onPress={() => router.push('/encyclopedia/updates')}
        >
          <ThemedView style={styles.toolCardContent}>
            <IconSymbol name="arrow.clockwise" size={32} color="#0a7ea4" style={styles.toolCardIcon} />
            <ThemedView style={styles.toolCardTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.toolCardTitle}>
                Content Updates
              </ThemedText>
              <ThemedText style={styles.toolCardDescription}>
                Sync with the latest research and health alerts
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color="#757575" />
          </ThemedView>
        </TouchableOpacity>
      </ThemedView>
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
    flexDirection: 'column',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  offlineButtonText: {
    marginLeft: 6,
    color: '#0a7ea4',
    fontWeight: '500',
    fontSize: 12,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  introText: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  climateLink: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  categoriesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  categoryItem: {
    flex: 1,
    margin: 4,
  },
  categoryContent: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryDescription: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    marginBottom: 12,
  },
  categoryDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  categoryDownloadText: {
    marginLeft: 6,
    color: '#0a7ea4',
    fontWeight: '500',
    fontSize: 12,
  },
  articleImage: {
    height: 150,
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#757575',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#757575',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAccessButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  quickAccessIcon: {
    marginRight: 8,
  },
  quickAccessText: {
    fontWeight: '500',
  },
  toolsContainer: {
    marginBottom: 24,
  },
  toolsTitle: {
    marginBottom: 12,
  },
  toolCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  toolCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toolCardIcon: {
    marginRight: 16,
  },
  toolCardTextContainer: {
    flex: 1,
  },
  toolCardTitle: {
    marginBottom: 4,
  },
  toolCardDescription: {
    fontSize: 14,
    color: '#757575',
  },
});
