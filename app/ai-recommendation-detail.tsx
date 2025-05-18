import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { sampleAIRecommendations, AIRecommendation } from '@/data/notifications';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  shareButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    color: '#757575',
    fontSize: 16,
  },
  backButtonLarge: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  scrollContent: {
    padding: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    color: '#757575',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  highConfidence: {
    backgroundColor: '#4CAF50',
  },
  mediumConfidence: {
    backgroundColor: '#FF9800',
  },
  lowConfidence: {
    backgroundColor: '#F44336',
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212121',
    marginBottom: 20,
  },
  image: {
    height: 200,
    borderRadius: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  dataPointsContainer: {
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    padding: 16,
  },
  dataPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dataPointText: {
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  actionNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionText: {
    flex: 1,
    lineHeight: 20,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitText: {
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  validityText: {
    marginLeft: 8,
    color: '#757575',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  secondaryButtonText: {
    color: '#9C27B0',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  feedbackTitle: {
    marginBottom: 12,
    color: '#757575',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedbackButtonText: {
    marginLeft: 8,
    color: '#616161',
  },
});

export default function AIRecommendationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        const foundRecommendation = sampleAIRecommendations.find(rec => rec.id === id);
        setRecommendation(foundRecommendation || null);
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, [id]);

  const navigateBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!recommendation) return;

    try {
      await Share.share({
        message: `Check out this agricultural recommendation: ${recommendation.title}\n\n${recommendation.description}\n\nShared from AgriConnect`,
      });
    } catch (error) {
      console.error('Error sharing recommendation:', error);
    }
  };

  // Get icon and color based on recommendation type
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'crop_management':
        return { icon: 'leaf.fill', color: '#4CAF50', label: 'Crop Management' };
      case 'livestock_management':
        return { icon: 'hare.fill', color: '#FF9800', label: 'Livestock Management' };
      case 'resource_optimization':
        return { icon: 'drop.fill', color: '#2196F3', label: 'Resource Optimization' };
      case 'pest_prevention':
        return { icon: 'ant.fill', color: '#F44336', label: 'Pest Prevention' };
      case 'disease_prevention':
        return { icon: 'cross.case.fill', color: '#9C27B0', label: 'Disease Prevention' };
      case 'market_opportunity':
        return { icon: 'chart.line.uptrend.xyaxis.fill', color: '#4CAF50', label: 'Market Opportunity' };
      default:
        return { icon: 'brain', color: '#9C27B0', label: 'AI Recommendation' };
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <ThemedText style={styles.loadingText}>Loading recommendation...</ThemedText>
      </ThemedView>
    );
  }

  if (!recommendation) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>Recommendation not found</ThemedText>
        <TouchableOpacity style={styles.backButtonLarge} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const typeInfo = getTypeInfo(recommendation.recommendationType);
  const confidencePercentage = Math.round(recommendation.confidence * 100);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#9C27B0" />
        </TouchableOpacity>
        <ThemedText type="title" numberOfLines={1} style={styles.headerTitle}>AI Recommendation</ThemedText>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <IconSymbol name="square.and.arrow.up" size={24} color="#9C27B0" />
        </TouchableOpacity>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={[styles.typeBadge, { backgroundColor: typeInfo.color }]}>
          <IconSymbol name={typeInfo.icon} size={16} color="white" />
          <ThemedText style={styles.typeText}>{typeInfo.label}</ThemedText>
        </ThemedView>

        <ThemedText type="title" style={styles.title}>{recommendation.title}</ThemedText>

        <ThemedView style={styles.metaContainer}>
          <ThemedView style={styles.metaItem}>
            <IconSymbol name="calendar" size={16} color="#757575" />
            <ThemedText style={styles.metaText}>
              {new Date(recommendation.timestamp).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.confidenceContainer}>
            <ThemedText style={styles.confidenceLabel}>AI Confidence</ThemedText>
            <ThemedView style={[
              styles.confidenceBadge,
              confidencePercentage >= 90 ? styles.highConfidence :
              confidencePercentage >= 70 ? styles.mediumConfidence :
              styles.lowConfidence
            ]}>
              <ThemedText style={styles.confidenceText}>{confidencePercentage}%</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedText style={styles.description}>{recommendation.description}</ThemedText>

        {recommendation.imageUrl && (
          <Image
            source={{ uri: recommendation.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Data Points Analyzed</ThemedText>
          <ThemedView style={styles.dataPointsContainer}>
            {recommendation.dataPoints.map((point, index) => (
              <ThemedView key={index} style={styles.dataPoint}>
                <IconSymbol name="circle.fill" size={8} color="#9C27B0" />
                <ThemedText style={styles.dataPointText}>{point}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Suggested Actions</ThemedText>
          <ThemedView style={styles.actionsContainer}>
            {recommendation.suggestedActions.map((action, index) => (
              <ThemedView key={index} style={styles.actionItem}>
                <ThemedView style={styles.actionNumberContainer}>
                  <ThemedText style={styles.actionNumber}>{index + 1}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.actionText}>{action}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Potential Benefits</ThemedText>
          <ThemedView style={styles.benefitsContainer}>
            {recommendation.potentialBenefits.map((benefit, index) => (
              <ThemedView key={index} style={styles.benefitItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {recommendation.validUntil && (
          <ThemedView style={styles.validityContainer}>
            <IconSymbol name="clock.fill" size={16} color="#757575" />
            <ThemedText style={styles.validityText}>
              Valid until: {new Date(recommendation.validUntil).toLocaleDateString()}
            </ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText}>Apply Recommendation</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <IconSymbol name="calendar.badge.plus" size={20} color="#9C27B0" />
            <ThemedText style={styles.secondaryButtonText}>Add to Calendar</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.feedbackContainer}>
          <ThemedText style={styles.feedbackTitle}>Was this recommendation helpful?</ThemedText>
          <ThemedView style={styles.feedbackButtons}>
            <TouchableOpacity style={styles.feedbackButton}>
              <IconSymbol name="hand.thumbsup.fill" size={20} color="#4CAF50" />
              <ThemedText style={styles.feedbackButtonText}>Yes</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.feedbackButton}>
              <IconSymbol name="hand.thumbsdown.fill" size={20} color="#F44336" />
              <ThemedText style={styles.feedbackButtonText}>No</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
