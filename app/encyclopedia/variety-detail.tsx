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
  PlantVarietyInfo
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

// Growth stage item component
const GrowthStageItem = ({ stage, durationDays, description }: { stage: string, durationDays: number, description: string }) => (
  <ThemedView style={styles.growthStageItem}>
    <ThemedView style={styles.growthStageHeader}>
      <ThemedText type="defaultSemiBold">{stage}</ThemedText>
      <ThemedView style={styles.durationBadge}>
        <ThemedText style={styles.durationText}>{durationDays} days</ThemedText>
      </ThemedView>
    </ThemedView>
    <ThemedText style={styles.growthStageDescription}>{description}</ThemedText>
  </ThemedView>
);

// Requirement level component
const RequirementLevel = ({ level }: { level: 'low' | 'medium' | 'high' | 'poor' | 'moderate' | 'good' }) => {
  const getColorForLevel = (level: string) => {
    switch (level) {
      case 'high':
      case 'good':
        return '#4CAF50';
      case 'medium':
      case 'moderate':
        return '#FFC107';
      case 'low':
      case 'poor':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  return (
    <ThemedView 
      style={[
        styles.requirementLevel, 
        { backgroundColor: getColorForLevel(level) }
      ]}
    >
      <ThemedText style={styles.requirementLevelText}>
        {level.toUpperCase()}
      </ThemedText>
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

export default function VarietyDetailScreen() {
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

  if (!item || !item.plantVarietyInfo) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol size={48} name="exclamationmark.triangle" color="#F44336" />
        <ThemedText style={styles.errorText}>Content not found or not a plant variety</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const varietyInfo = item.plantVarietyInfo;

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
          <IconSymbol name="leaf.fill" size={16} color="white" />
          <ThemedText style={styles.typeText}>Plant Variety</ThemedText>
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
        <ThemedText>{varietyInfo.origin}</ThemedText>
      </ThemedView>

      <Collapsible title="Characteristics" initiallyExpanded={true}>
        {varietyInfo.characteristics.map((characteristic, index) => (
          <BulletListItem key={index} text={characteristic} />
        ))}
      </Collapsible>

      <Collapsible title="Growth Cycle">
        <ThemedView style={styles.growthCycleContainer}>
          {varietyInfo.growthCycle.map((stage, index) => (
            <GrowthStageItem 
              key={index} 
              stage={stage.stage} 
              durationDays={stage.durationDays} 
              description={stage.description} 
            />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Planting Information">
        <ThemedView style={styles.infoContainer}>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Sowing Period:</ThemedText>
            <ThemedText>{varietyInfo.plantingInfo.sowingPeriod}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Harvest Period:</ThemedText>
            <ThemedText>{varietyInfo.plantingInfo.harvestPeriod}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Sowing Depth:</ThemedText>
            <ThemedText>{varietyInfo.plantingInfo.sowingDepth}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Plant Spacing:</ThemedText>
            <ThemedText>{varietyInfo.plantingInfo.plantSpacing}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Row Spacing:</ThemedText>
            <ThemedText>{varietyInfo.plantingInfo.rowSpacing}</ThemedText>
          </ThemedView>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Water Requirements">
        <ThemedView style={styles.waterRequirementsContainer}>
          <ThemedView style={styles.waterLevelContainer}>
            <ThemedText type="defaultSemiBold">Water Needs:</ThemedText>
            <RequirementLevel level={varietyInfo.waterRequirements} />
          </ThemedView>
          <ThemedText style={styles.waterSchedule}>{varietyInfo.wateringSchedule}</ThemedText>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Soil Requirements">
        <ThemedView style={styles.soilRequirementsContainer}>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Soil Types:</ThemedText>
            <ThemedText>{varietyInfo.soilRequirements.soilType.join(', ')}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">pH Range:</ThemedText>
            <ThemedText>{varietyInfo.soilRequirements.pHRange.min} - {varietyInfo.soilRequirements.pHRange.max}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText type="defaultSemiBold">Drainage:</ThemedText>
            <RequirementLevel level={varietyInfo.soilRequirements.drainageLevel} />
          </ThemedView>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Fertilizer Recommendations">
        {varietyInfo.fertilizerRecommendations.map((fertilizer, index) => (
          <ThemedView key={index} style={styles.fertilizerItem}>
            <ThemedText type="defaultSemiBold">{fertilizer.type}</ThemedText>
            <ThemedView style={styles.fertilizerDetails}>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.fertilizerLabel}>Rate:</ThemedText>
                <ThemedText>{fertilizer.applicationRate}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.fertilizerLabel}>Frequency:</ThemedText>
                <ThemedText>{fertilizer.frequency}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.fertilizerLabel}>Timing:</ThemedText>
                <ThemedText>{fertilizer.timing}</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        ))}
      </Collapsible>

      <Collapsible title="Pest Management">
        <ThemedView style={styles.managementContainer}>
          <ThemedText type="defaultSemiBold">Common Pests:</ThemedText>
          <ThemedText style={styles.managementText}>{varietyInfo.pestManagement.commonPests.join(', ')}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.managementSubtitle}>Prevention Methods:</ThemedText>
          {varietyInfo.pestManagement.preventionMethods.map((method, index) => (
            <BulletListItem key={index} text={method} />
          ))}
          
          <ThemedText type="defaultSemiBold" style={styles.managementSubtitle}>Treatments:</ThemedText>
          {varietyInfo.pestManagement.treatments.map((treatment, index) => (
            <BulletListItem key={index} text={treatment} />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Disease Management">
        <ThemedView style={styles.managementContainer}>
          <ThemedText type="defaultSemiBold">Common Diseases:</ThemedText>
          <ThemedText style={styles.managementText}>{varietyInfo.diseaseManagement.commonDiseases.join(', ')}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.managementSubtitle}>Prevention Methods:</ThemedText>
          {varietyInfo.diseaseManagement.preventionMethods.map((method, index) => (
            <BulletListItem key={index} text={method} />
          ))}
          
          <ThemedText type="defaultSemiBold" style={styles.managementSubtitle}>Treatments:</ThemedText>
          {varietyInfo.diseaseManagement.treatments.map((treatment, index) => (
            <BulletListItem key={index} text={treatment} />
          ))}
        </ThemedView>
      </Collapsible>

      <Collapsible title="Expected Yield">
        <ThemedView style={styles.yieldContainer}>
          <ThemedView style={styles.yieldRange}>
            <ThemedText type="defaultSemiBold" style={styles.yieldValue}>{varietyInfo.expectedYield.minYield} - {varietyInfo.expectedYield.maxYield} {varietyInfo.expectedYield.unit}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.yieldConditions}>{varietyInfo.expectedYield.conditions}</ThemedText>
        </ThemedView>
      </Collapsible>

      <Collapsible title="Storage Requirements">
        <ThemedText>{varietyInfo.storageRequirements}</ThemedText>
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
  growthCycleContainer: {
    marginVertical: 8,
  },
  growthStageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  growthStageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  growthStageDescription: {
    fontSize: 14,
  },
  infoContainer: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  waterRequirementsContainer: {
    marginVertical: 8,
  },
  waterLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterSchedule: {
    fontSize: 14,
    lineHeight: 20,
  },
  soilRequirementsContainer: {
    marginVertical: 8,
  },
  requirementLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requirementLevelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fertilizerItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  fertilizerDetails: {
    marginTop: 8,
  },
  fertilizerLabel: {
    color: '#757575',
    width: 80,
  },
  managementContainer: {
    marginVertical: 8,
  },
  managementText: {
    marginBottom: 12,
  },
  managementSubtitle: {
    marginTop: 12,
    marginBottom: 8,
  },
  yieldContainer: {
    marginVertical: 8,
  },
  yieldRange: {
    marginBottom: 8,
  },
  yieldValue: {
    fontSize: 18,
  },
  yieldConditions: {
    fontSize: 14,
    color: '#757575',
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
