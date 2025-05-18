import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Collapsible } from '@/components/Collapsible';
import { TextToSpeech } from '@/components/accessibility/TextToSpeech';
import { useOffline } from '@/context/OfflineContext';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import {
  encyclopediaCategories,
  EncyclopediaItem,
  EncyclopediaImage,
  EncyclopediaTreatment
} from '@/data/encyclopedia';

const { width: screenWidth } = Dimensions.get('window');

// Treatment card component
const TreatmentCard = ({ treatment }: { treatment: EncyclopediaTreatment }) => {
  const getEffectivenessColor = (level: string) => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'low': return '#F44336';
      default: return '#757575';
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'high': return '#F44336';
      default: return '#757575';
    }
  };

  const getCostColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FFC107';
      case 'high': return '#F44336';
      default: return '#757575';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chemical': return 'flask.fill';
      case 'biological': return 'leaf.fill';
      case 'mechanical': return 'wrench.and.screwdriver.fill';
      case 'cultural': return 'person.crop.circle.fill';
      default: return 'questionmark.circle.fill';
    }
  };

  return (
    <ThemedView style={styles.treatmentCard}>
      <ThemedView style={styles.treatmentHeader}>
        <ThemedView style={styles.treatmentTypeContainer}>
          <IconSymbol name={getTypeIcon(treatment.type)} size={16} color="white" />
          <ThemedText style={styles.treatmentType}>
            {treatment.type.charAt(0).toUpperCase() + treatment.type.slice(1)}
          </ThemedText>
        </ThemedView>
        <ThemedText type="subtitle">{treatment.name}</ThemedText>
      </ThemedView>

      <ThemedText style={styles.treatmentDescription}>{treatment.description}</ThemedText>

      {treatment.dosage && (
        <ThemedView style={styles.treatmentDetail}>
          <ThemedText type="defaultSemiBold">Dosage: </ThemedText>
          <ThemedText>{treatment.dosage}</ThemedText>
        </ThemedView>
      )}

      {treatment.applicationMethod && (
        <ThemedView style={styles.treatmentDetail}>
          <ThemedText type="defaultSemiBold">Application: </ThemedText>
          <ThemedText>{treatment.applicationMethod}</ThemedText>
        </ThemedView>
      )}

      {treatment.frequency && (
        <ThemedView style={styles.treatmentDetail}>
          <ThemedText type="defaultSemiBold">Frequency: </ThemedText>
          <ThemedText>{treatment.frequency}</ThemedText>
        </ThemedView>
      )}

      {treatment.precautions && treatment.precautions.length > 0 && (
        <ThemedView style={styles.treatmentPrecautions}>
          <ThemedText type="defaultSemiBold">Precautions:</ThemedText>
          {treatment.precautions.map((precaution, index) => (
            <ThemedView key={index} style={styles.precautionItem}>
              <ThemedText style={styles.bulletPoint}>•</ThemedText>
              <ThemedText style={styles.precautionText}>{precaution}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <ThemedView style={styles.treatmentMetrics}>
        <ThemedView style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Effectiveness</ThemedText>
          <ThemedView
            style={[
              styles.metricValue,
              { backgroundColor: getEffectivenessColor(treatment.effectiveness) }
            ]}
          >
            <ThemedText style={styles.metricValueText}>
              {treatment.effectiveness.toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Environmental Impact</ThemedText>
          <ThemedView
            style={[
              styles.metricValue,
              { backgroundColor: getImpactColor(treatment.environmentalImpact) }
            ]}
          >
            <ThemedText style={styles.metricValueText}>
              {treatment.environmentalImpact.toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.metricItem}>
          <ThemedText style={styles.metricLabel}>Cost</ThemedText>
          <ThemedView
            style={[
              styles.metricValue,
              { backgroundColor: getCostColor(treatment.cost) }
            ]}
          >
            <ThemedText style={styles.metricValueText}>
              {treatment.cost.toUpperCase()}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

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

// List item with bullet point
const BulletListItem = ({ text }: { text: string }) => (
  <ThemedView style={styles.bulletListItem}>
    <ThemedText style={styles.bulletPoint}>•</ThemedText>
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

export default function DetailScreen() {
  const router = useRouter();
  const { itemId } = useLocalSearchParams();
  const { isOnline, downloadForOffline, isContentAvailableOffline, getOfflineContent } = useOffline();
  const { preferences } = useAccessibilityContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [item, setItem] = useState<EncyclopediaItem | null>(null);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const carouselRef = useRef(null);

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
      Alert.alert(
        'Offline Mode',
        'You need to be online to download content for offline use.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!item) return;

    setIsDownloading(true);

    try {
      const success = await downloadForOffline('encyclopedia', item.id);

      if (success) {
        setIsDownloaded(true);
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
      setIsDownloading(false);
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

  if (!item) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol size={48} name="exclamationmark.triangle" color="#F44336" />
        <ThemedText style={styles.errorText}>Content not found</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
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

      <ThemedView style={styles.titleContainer}>
        <ThemedView style={styles.titleRow}>
          <ThemedText type="title">{item.title}</ThemedText>
          {preferences.textToSpeech && (
            <TextToSpeech
              text={item.title}
              contentDescription={`Title: ${item.title}`}
              style={styles.textToSpeechButton}
            />
          )}
        </ThemedView>
        <ThemedView style={styles.typeContainer}>
          <IconSymbol
            name={
              item.type === 'disease' ? 'cross.case.fill' :
              item.type === 'pest' ? 'ladybug.fill' :
              item.type === 'technique' ? 'wrench.and.screwdriver.fill' :
              'info.circle.fill'
            }
            size={16}
            color="white"
          />
          <ThemedText style={styles.typeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
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
            ref={carouselRef}
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

      <ThemedView style={styles.descriptionContainer}>
        <ThemedText style={styles.description}>{item.fullDescription}</ThemedText>
        {preferences.textToSpeech && (
          <TextToSpeech
            text={item.fullDescription}
            contentDescription="Description"
            style={styles.descriptionTextToSpeech}
          />
        )}
      </ThemedView>

      {item.symptoms && item.symptoms.length > 0 && (
        <Collapsible title="Symptoms" initiallyExpanded={true}>
          {item.symptoms.map((symptom, index) => (
            <BulletListItem key={index} text={symptom} />
          ))}
        </Collapsible>
      )}

      {item.causes && item.causes.length > 0 && (
        <Collapsible title="Causes">
          {item.causes.map((cause, index) => (
            <BulletListItem key={index} text={cause} />
          ))}
        </Collapsible>
      )}

      {item.riskFactors && item.riskFactors.length > 0 && (
        <Collapsible title="Risk Factors">
          {item.riskFactors.map((factor, index) => (
            <BulletListItem key={index} text={factor} />
          ))}
        </Collapsible>
      )}

      {item.diagnosis && (
        <Collapsible title="Diagnosis">
          <ThemedText>{item.diagnosis}</ThemedText>
        </Collapsible>
      )}

      {item.treatments && item.treatments.length > 0 && (
        <Collapsible title="Treatments" initiallyExpanded={true}>
          {item.treatments.map((treatment, index) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </Collapsible>
      )}

      {item.preventionMeasures && item.preventionMeasures.length > 0 && (
        <Collapsible title="Prevention Measures">
          {item.preventionMeasures.map((measure, index) => (
            <BulletListItem key={index} text={measure} />
          ))}
        </Collapsible>
      )}

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
  titleContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  textToSpeechButton: {
    marginLeft: 8,
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
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  description: {
    flex: 1,
    lineHeight: 22,
  },
  descriptionTextToSpeech: {
    marginLeft: 8,
    marginTop: 2,
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
  treatmentCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  treatmentHeader: {
    marginBottom: 12,
  },
  treatmentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  treatmentType: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  treatmentDescription: {
    marginBottom: 12,
  },
  treatmentDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  treatmentPrecautions: {
    marginTop: 8,
    marginBottom: 12,
  },
  precautionItem: {
    flexDirection: 'row',
    marginTop: 4,
  },
  precautionText: {
    flex: 1,
    fontSize: 14,
  },
  treatmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  metricValueText: {
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
