import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { 
  encyclopediaCategories, 
  EncyclopediaItem
} from '@/data/encyclopedia';

// Item card component
const ItemCard = ({ item, onPress, onRemoveFavorite }) => (
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
        <TouchableOpacity onPress={() => onRemoveFavorite(item)}>
          <IconSymbol
            name="star.fill"
            size={20}
            color="#FFC107"
          />
        </TouchableOpacity>
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
            {getDisplayTypeForType(item.type)}
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
    case 'animal_breed':
      return 'pawprint.fill';
    case 'plant_variety':
      return 'leaf.fill';
    default:
      return 'info.circle.fill';
  }
};

// Helper function to get display type for item type
const getDisplayTypeForType = (type: string) => {
  switch (type) {
    case 'disease':
      return 'Disease';
    case 'pest':
      return 'Pest';
    case 'technique':
      return 'Technique';
    case 'animal_breed':
      return 'Animal Breed';
    case 'plant_variety':
      return 'Plant Variety';
    default:
      return 'General';
  }
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<EncyclopediaItem[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be loaded from storage
        // For now, we'll search our mock data for items marked as favorites
        const favoritedItems: EncyclopediaItem[] = [];
        
        for (const category of encyclopediaCategories) {
          for (const subcategory of category.subcategories) {
            for (const item of subcategory.items) {
              if (item.isFavorite) {
                favoritedItems.push(item);
              }
            }
          }
        }
        
        setFavorites(favoritedItems);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const handleItemPress = (item: EncyclopediaItem) => {
    if (item.type === 'animal_breed') {
      router.push(`/encyclopedia/breed-detail?itemId=${item.id}`);
    } else if (item.type === 'plant_variety') {
      router.push(`/encyclopedia/variety-detail?itemId=${item.id}`);
    } else {
      router.push(`/encyclopedia/detail?itemId=${item.id}`);
    }
  };

  const handleRemoveFavorite = (item: EncyclopediaItem) => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${item.title}" from your favorites?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: () => {
            // Update the item's favorite status
            item.isFavorite = false;
            
            // Remove from the favorites list
            setFavorites(prevFavorites => 
              prevFavorites.filter(favorite => favorite.id !== item.id)
            );
            
            // In a real app, we would save this to storage
          },
          style: 'destructive'
        }
      ]
    );
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={styles.title}>Favorites</ThemedText>
      
      <ThemedText style={styles.description}>
        Your saved encyclopedia items for quick access.
      </ThemedText>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some content may not be available.
          </ThemedText>
        </ThemedView>
      )}

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading favorites...</ThemedText>
        </ThemedView>
      ) : favorites.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol size={48} name="star" color="#757575" />
          <ThemedText style={styles.emptyText}>No favorites yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add items to your favorites by tapping the star icon on any encyclopedia item.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <ItemCard 
              item={item} 
              onPress={handleItemPress} 
              onRemoveFavorite={handleRemoveFavorite}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.itemsContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
  },
  itemsContainer: {
    gap: 16,
    paddingBottom: 24,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
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
