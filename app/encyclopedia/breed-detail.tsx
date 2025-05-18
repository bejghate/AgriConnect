import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Collapsible } from '@/components/Collapsible';
import { useOffline } from '@/context/OfflineContext';
import { 
  encyclopediaCategories, 
  EncyclopediaItem,
  EncyclopediaImage,
  AnimalBreedInfo
} from '@/data/encyclopedia';

const { width: screenWidth } = Dimensions.get('window');

// Image carousel item
const CarouselItem = ({ item }: { item: EncyclopediaImage }) => (
  <View style={styles.carouselItemContainer}>
    <Image
      source={{ uri: item.url }}
      style={styles.carouselImage}
      contentFit="cover"
      placeholder={require('@/assets/images/react-logo.png')}
      transition={300}
    />
    <ThemedView style={styles.imageCaption}>
      <ThemedText style={styles.captionText}>{item.caption}</ThemedText>
      {item.isHighResolution && (
        <ThemedView style={styles.hdBadge}>
          <ThemedText style={styles.hdBadgeText}>HD</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  </View>
);

// Stat item component
const StatItem = ({ name, value, unit }: { name: string, value: string, unit: string }) => (
  <ThemedView style={styles.statItem}>
    <ThemedText style={styles.statName}>{name}</ThemedText>
    <ThemedView style={styles.statValueContainer}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      {unit && <ThemedText style={styles.statUnit}>{unit}</ThemedText>}
    </ThemedView>
  </ThemedView>
);

// Resistance item component
const ResistanceItem = ({ name, level }: { name: string, level: 'low' | 'medium' | 'high' }) => {
  const getColorForLevel = (level: string) => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'low': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <ThemedView style={styles.resistanceItem}>
      <ThemedText style={styles.resistanceName}>{name}</ThemedText>
      <ThemedView 
        style={[
          styles.resistanceLevel, 
          { backgroundColor: getColorForLevel(level) }
        ]}
      >
        <ThemedText style={styles.resistanceLevelText}>
          {level.toUpperCase()}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

// List item with bullet point
const BulletListItem = ({ text }: { text: string }) => (
  <ThemedView style={styles.bulletListItem}>
    <ThemedText style={styles.bulletPoint}>•</ThemedText>
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

export default function BreedDetailScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const { isOnline, downloadForOffline, isContentAvailableOffline, getOfflineContent } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [item, setItem] = useState<EncyclopediaItem | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      try {
        // Check if the item is available offline
        const isAvailableOffline = await isContentAvailableOffline('encyclopedia', itemId as string);
        setIsDownloaded(isAvailableOffline);
        
        let foundItem: EncyclopediaItem | null = null;
        
        if (isAvailableOffline) {
          // Get the item from offline storage
          foundItem = await getOfflineContent<EncyclopediaItem>('encyclopedia', itemId as string);
        } else {
          // In a real app, this would be an API call if online
          // For now, we'll search our mock data
          for (const category of encyclopediaCategories) {
            for (const subcategory of category.subcategories) {
              const item = subcategory.items.find(item => item.id === itemId);
              if (item) {
                foundItem = item;
                break;
              }
            }
            if (foundItem) break;
          }
        }
        
        if (foundItem) {
          setItem(foundItem);
          setIsFavorite(foundItem.isFavorite || false);
          
          // Update last viewed timestamp
          if (foundItem) {
            foundItem.lastViewed = Date.now();
            // In a real app, we would save this to storage
          }
        }
      } catch (error) {
        console.error('Error loading item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const handleDownload = async () => {
    if (!isOnline) {
      alert('You need to be online to download content for offline use.');
      return;
    }

    if (!item) return;

    setIsDownloading(true);

    try {
      const success = await downloadForOffline('encyclopedia', item.id);

      if (success) {
        setIsDownloaded(true);
        alert(`"${item.title}" is now available offline.`);
      } else {
        alert('There was an error downloading the content. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading item:', error);
      alert('An unexpected error occurred. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const toggleFavorite = () => {
    if (!item) return;
    
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    
    // In a real app, we would save this to storage
    item.isFavorite = newFavoriteStatus;
    
    if (newFavoriteStatus) {
      alert(`"${item.title}" has been added to your favorites.`);
    } else {
      alert(`"${item.title}" has been removed from your favorites.`);
    }
  };

  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading content...</ThemedText>
      </ThemedView>
    );
  }

  if (!item || !item.animalBreedInfo) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol size={48} name="exclamationmark.triangle" color="#F44336" />
        <ThemedText style={styles.errorText}>Content not found or not a breed</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const breedInfo = item.animalBreedInfo;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedView style={styles.headerActions}>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <IconSymbol
              name={isFavorite ? "star.fill" : "star"}
              size={24}
              color={isFavorite ? "#FFC107" : "#0a7ea4"}
            />
          </TouchableOpacity>
          
          {isDownloading ? (
            <ActivityIndicator size="small" color="#0a7ea4" />
          ) : (
            <TouchableOpacity onPress={handleDownload} disabled={isDownloaded}>
              <IconSymbol
                name={isDownloaded ? "arrow.down.circle.fill" : "arrow.down.circle"}
                size={24}
                color="#0a7ea4"
              />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{item.title}</ThemedText>
        <ThemedView style={styles.typeContainer}>
          <IconSymbol name="pawprint.fill" size={16} color="white" />
          <ThemedText style={styles.typeText}>
            {breedInfo.productionType.charAt(0).toUpperCase() + breedInfo.productionType.slice(1)} Breed
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {!isOnline && !isDownloaded && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some content may not be available.
          </ThemedText>
        </ThemedView>
      )}

      {item.images && item.images.length > 0 && (
        <ThemedView style={styles.carouselContainer}>
          <Carousel
            loop
            width={screenWidth - 32}
            height={240}
            autoPlay={false}
            data={item.images}
            scrollAnimationDuration={1000}
            onSnapToItem={(index) => setActiveImageIndex(index)}
            renderItem={({ item }) => <CarouselItem item={item} />}
          />
          
          {item.images.length > 1 && (
            <ThemedView style={styles.pagination}>
              {item.images.map((_, index) => (
                <ThemedView
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeImageIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </ThemedView>
          )}
        </ThemedView>
      )}

      <ThemedText style={styles.description}>{item.fullDescription}</ThemedText>

      <ThemedView style={styles.originContainer}>
        <ThemedText type="defaultSemiBold">Origin: </ThemedText>
        <ThemedText>{breedInfo.origin}</ThemedText>
      </ThemedView>

      <Collapsible title="Characteristics" initiallyExpanded={true}>
        {breedInfo.characteristics.map((characteristic, index) => (
          <BulletListItem key={index} text={characteristic} />
        ))}
      </Collapsible>

      <Collapsible title="Production Statistics">
        <ThemedView style={styles.statsContainer}>
          {breedInfo.productionStats.map((stat, index) => (
            <StatItem 
              key={index} 
              name={stat.name} 
              value={stat.value} 
              unit={stat.unit} 
            />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Disease Resistance">
        <ThemedView style={styles.resistanceContainer}>
          {breedInfo.diseaseResistance.map((resistance, index) => (
            <ResistanceItem 
              key={index} 
              name={resistance.diseaseName} 
              level={resistance.resistanceLevel} 
            />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Climate Adaptation">
        <ThemedView style={styles.resistanceContainer}>
          {breedInfo.climateAdaptation.map((adaptation, index) => (
            <ResistanceItem 
              key={index} 
              name={adaptation.climateType} 
              level={adaptation.adaptationLevel} 
            />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Breeding Information">
        <ThemedText>{breedInfo.breedingInfo}</ThemedText>
      </Collapsible>

      <Collapsible title="Nutrition Requirements">
        <ThemedText>{breedInfo.nutritionRequirements}</ThemedText>
      </Collapsible>

      <Collapsible title="Housing Requirements">
        <ThemedText>{breedInfo.housingRequirements}</ThemedText>
      </Collapsible>

      {item.tags && item.tags.length > 0 && (
        <ThemedView style={styles.tagsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.tagsTitle}>Tags:</ThemedText>
          <ThemedView style={styles.tagsList}>
            {item.tags.map((tag, index) => (
              <ThemedView key={index} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  favoriteButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  carouselContainer: {
    marginBottom: 16,
  },
  carouselItemContainer: {
    width: screenWidth - 32,
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  imageCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captionText: {
    color: 'white',
    fontSize: 12,
    flex: 1,
  },
  hdBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  hdBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0a7ea4',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  originContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bulletListItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    marginRight: 8,
    fontSize: 16,
  },
  bulletText: {
    flex: 1,
  },
  statsContainer: {
    marginVertical: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statName: {
    flex: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statUnit: {
    marginLeft: 4,
    fontSize: 12,
    color: '#757575',
  },
  resistanceContainer: {
    marginVertical: 8,
  },
  resistanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resistanceName: {
    flex: 1,
  },
  resistanceLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resistanceLevelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tagsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  tagsTitle: {
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#757575',
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
