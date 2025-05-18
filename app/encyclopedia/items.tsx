import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useOffline } from '@/context/OfflineContext';
import { 
  encyclopediaCategories, 
  EncyclopediaCategory, 
  EncyclopediaSubcategory,
  EncyclopediaItem
} from '@/data/encyclopedia';

// Item card component
const ItemCard = ({ item, onPress, isDownloaded, onDownload, isDownloading }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.itemCard}>
    {item.images && item.images.length > 0 && (
      <Image 
        source={{ uri: item.images[0].url }} 
        style={styles.itemImage}
        contentFit="cover"
        placeholder={require('@/assets/images/react-logo.png')}
        transition={200}
      />
    )}
    <ThemedView style={styles.itemContent}>
      <ThemedView style={styles.itemHeader}>
        <ThemedText type="subtitle" numberOfLines={1} style={styles.itemTitle}>
          {item.title}
        </ThemedText>
        {isDownloading ? (
          <ActivityIndicator size="small" color="#0a7ea4" />
        ) : (
          <TouchableOpacity onPress={() => onDownload(item)} disabled={isDownloaded}>
            <IconSymbol
              name={isDownloaded ? "arrow.down.circle.fill" : "arrow.down.circle"}
              size={20}
              color="#0a7ea4"
            />
          </TouchableOpacity>
        )}
      </ThemedView>
      <ThemedText numberOfLines={2} style={styles.itemDescription}>
        {item.shortDescription}
      </ThemedText>
      <ThemedView style={styles.itemFooter}>
        <ThemedView style={styles.itemTypeContainer}>
          <IconSymbol 
            name={getIconForType(item.type)} 
            size={12} 
            color="white" 
          />
          <ThemedText style={styles.itemType}>
            {capitalizeFirstLetter(item.type)}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.readMore}>Read more</ThemedText>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

// Helper function to get icon for item type
const getIconForType = (type: string) => {
  switch (type) {
    case 'disease':
      return 'cross.case.fill';
    case 'pest':
      return 'ladybug.fill';
    case 'technique':
      return 'wrench.and.screwdriver.fill';
    default:
      return 'info.circle.fill';
  }
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function ItemsScreen() {
  const router = useRouter();
  const { subcategoryId } = useLocalSearchParams();
  const { isOnline, downloadForOffline, isContentAvailableOffline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subcategory, setSubcategory] = useState<EncyclopediaSubcategory | null>(null);
  const [parentCategory, setParentCategory] = useState<EncyclopediaCategory | null>(null);
  const [items, setItems] = useState<EncyclopediaItem[]>([]);
  const [downloadingItemId, setDownloadingItemId] = useState<string | null>(null);

  useEffect(() => {
    const loadSubcategory = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use our mock data
        let foundSubcategory: EncyclopediaSubcategory | null = null;
        let foundParentCategory: EncyclopediaCategory | null = null;
        
        for (const category of encyclopediaCategories) {
          const subcat = category.subcategories.find(sub => sub.id === subcategoryId);
          if (subcat) {
            foundSubcategory = subcat;
            foundParentCategory = category;
            break;
          }
        }
        
        if (foundSubcategory) {
          setSubcategory(foundSubcategory);
          setParentCategory(foundParentCategory);
          
          // Check which items are available offline
          const itemsWithDownloadStatus = await Promise.all(
            foundSubcategory.items.map(async (item) => {
              const isDownloaded = await isContentAvailableOffline('encyclopedia', item.id);
              return { ...item, isDownloaded };
            })
          );
          
          setItems(itemsWithDownloadStatus);
        }
      } catch (error) {
        console.error('Error loading subcategory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubcategory();
  }, [subcategoryId]);

  const handleItemPress = (item: EncyclopediaItem) => {
    router.push(`/encyclopedia/detail?itemId=${item.id}`);
  };

  const handleDownloadItem = async (item: EncyclopediaItem) => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to download content for offline use.',
        [{ text: 'OK' }]
      );
      return;
    }

    setDownloadingItemId(item.id);

    try {
      const success = await downloadForOffline('encyclopedia', item.id);

      if (success) {
        // Update the item's download status
        setItems(prevItems =>
          prevItems.map(i =>
            i.id === item.id ? { ...i, isDownloaded: true } : i
          )
        );

        Alert.alert(
          'Download Complete',
          `"${item.title}" is now available offline.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Download Failed',
          'There was an error downloading the content. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading item:', error);
      Alert.alert(
        'Download Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setDownloadingItemId(null);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  const navigateToCategory = () => {
    if (parentCategory) {
      router.push(`/encyclopedia/subcategories?categoryId=${parentCategory.id}`);
    } else {
      router.push('/encyclopedia');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
      </ThemedView>
    );
  }

  if (!subcategory) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol size={48} name="exclamationmark.triangle" color="#F44336" />
        <ThemedText style={styles.errorText}>Subcategory not found</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name={subcategory.icon}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.breadcrumbContainer}>
        {parentCategory && (
          <>
            <TouchableOpacity onPress={navigateToCategory}>
              <ThemedText style={styles.breadcrumbLink}>{parentCategory.title}</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.breadcrumbSeparator}>/</ThemedText>
          </>
        )}
        <ThemedText style={styles.breadcrumbCurrent}>{subcategory.title}</ThemedText>
      </ThemedView>

      <ThemedText type="title" style={styles.subcategoryTitle}>{subcategory.title}</ThemedText>
      
      <ThemedText style={styles.subcategoryDescription}>
        {subcategory.description}
      </ThemedText>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some content may not be available.
          </ThemedText>
        </ThemedView>
      )}

      {items.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol size={48} name="doc.text" color="#757575" />
          <ThemedText style={styles.emptyText}>No items found in this subcategory</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <ItemCard 
              item={item} 
              onPress={handleItemPress} 
              isDownloaded={item.isDownloaded}
              onDownload={handleDownloadItem}
              isDownloading={downloadingItemId === item.id}
            />
          )}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.itemsContainer}
        />
      )}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  breadcrumbLink: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: '#757575',
    fontSize: 14,
  },
  breadcrumbCurrent: {
    color: '#757575',
    fontSize: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  subcategoryTitle: {
    marginBottom: 8,
  },
  subcategoryDescription: {
    marginBottom: 24,
  },
  itemsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  itemImage: {
    height: 160,
    width: '100%',
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    marginRight: 8,
  },
  itemDescription: {
    marginBottom: 12,
    fontSize: 14,
    color: '#757575',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemType: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  readMore: {
    color: '#0a7ea4',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
    marginTop: 16,
    color: '#757575',
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
});
