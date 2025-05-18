import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Chip } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { sampleAIRecommendations, AIRecommendation } from '@/data/notifications';

// AI Recommendation Card Component
const AIRecommendationCard = ({
  recommendation,
  onPress
}: {
  recommendation: AIRecommendation,
  onPress: (recommendation: AIRecommendation) => void
}) => {
  // Get icon and color based on recommendation type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crop_management':
        return { icon: 'leaf.fill', color: '#4CAF50' };
      case 'livestock_management':
        return { icon: 'hare.fill', color: '#FF9800' };
      case 'resource_optimization':
        return { icon: 'drop.fill', color: '#2196F3' };
      case 'pest_prevention':
        return { icon: 'ant.fill', color: '#F44336' };
      case 'disease_prevention':
        return { icon: 'cross.case.fill', color: '#9C27B0' };
      case 'market_opportunity':
        return { icon: 'chart.line.uptrend.xyaxis.fill', color: '#4CAF50' };
      default:
        return { icon: 'brain', color: '#9C27B0' };
    }
  };

  const typeInfo = getTypeIcon(recommendation.recommendationType);

  // Format confidence as percentage
  const confidencePercentage = Math.round(recommendation.confidence * 100);

  return (
    <TouchableOpacity
      style={[
        styles.recommendationCard,
        !recommendation.isRead && styles.unreadCard
      ]}
      onPress={() => onPress(recommendation)}
    >
      <ThemedView style={styles.cardHeader}>
        <ThemedView style={styles.cardHeaderLeft}>
          <IconSymbol name="brain" size={20} color="#9C27B0" />
          <ThemedText type="defaultSemiBold" style={styles.aiLabel}>AI Recommendation</ThemedText>
        </ThemedView>

        <ThemedView style={styles.confidenceContainer}>
          <ThemedText style={styles.confidenceLabel}>Confidence</ThemedText>
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

      <ThemedView style={styles.cardContent}>
        <ThemedView style={styles.cardTitleContainer}>
          <ThemedView style={[styles.typeBadge, { backgroundColor: typeInfo.color }]}>
            <IconSymbol name={typeInfo.icon} size={12} color="white" />
            <ThemedText style={styles.typeText}>
              {recommendation.recommendationType.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </ThemedText>
          </ThemedView>

          <ThemedText type="subtitle" style={styles.cardTitle}>{recommendation.title}</ThemedText>
        </ThemedView>

        <ThemedText style={styles.cardDescription}>{recommendation.description}</ThemedText>

        {recommendation.imageUrl && (
          <Image
            source={{ uri: recommendation.imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
          />
        )}

        <ThemedView style={styles.tagsContainer}>
          {recommendation.applicableCrops?.map((crop, index) => (
            <Chip key={`crop-${index}`} style={styles.cropTag}>
              {crop}
            </Chip>
          ))}

          {recommendation.applicableLivestock?.map((livestock, index) => (
            <Chip key={`livestock-${index}`} style={styles.livestockTag}>
              {livestock}
            </Chip>
          ))}
        </ThemedView>

        <ThemedView style={styles.cardFooter}>
          <ThemedText style={styles.timestamp}>
            {new Date(recommendation.timestamp).toLocaleDateString()}
          </ThemedText>

          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <ThemedText style={styles.actionText}>Apply</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol name="bookmark.fill" size={16} color="#2196F3" />
              <ThemedText style={styles.actionText}>Save</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

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
  backButton: {
    marginRight: 16,
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3e5f5',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#616161',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedFilterChip: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#616161',
  },
  selectedFilterText: {
    color: 'white',
  },
  recommendationsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    color: '#757575',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    padding: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiLabel: {
    marginLeft: 8,
    color: '#9C27B0',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: 10,
    color: '#757575',
    marginBottom: 2,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  cardTitleContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#616161',
    marginBottom: 12,
  },
  cardImage: {
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  cropTag: {
    backgroundColor: '#e8f5e9',
    marginRight: 8,
    marginBottom: 8,
  },
  livestockTag: {
    backgroundColor: '#fff3e0',
    marginRight: 8,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#616161',
  },
});

export default function AIRecommendationsScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        setRecommendations(sampleAIRecommendations);
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const handleRecommendationPress = (recommendation: AIRecommendation) => {
    router.push(`/ai-recommendation-detail?id=${recommendation.id}`);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? null : type);
  };

  const filteredRecommendations = selectedType
    ? recommendations.filter(rec => rec.recommendationType === selectedType)
    : recommendations;

  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <ThemedText style={styles.loadingText}>Loading AI recommendations...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#9C27B0" />
        </TouchableOpacity>
        <ThemedText type="title">AI Recommendations</ThemedText>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.infoContainer}>
        <IconSymbol name="brain" size={24} color="#9C27B0" />
        <ThemedView style={styles.infoContent}>
          <ThemedText type="defaultSemiBold">Personalized AI Recommendations</ThemedText>
          <ThemedText style={styles.infoText}>
            These recommendations are generated based on your farm data, local conditions, and historical patterns.
            The AI analyzes multiple data points to provide actionable insights for your specific situation.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'crop_management' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('crop_management')}
        >
          <IconSymbol name="leaf.fill" size={16} color={selectedType === 'crop_management' ? "white" : "#4CAF50"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'crop_management' && styles.selectedFilterText
          ]}>Crop Management</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'livestock_management' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('livestock_management')}
        >
          <IconSymbol name="hare.fill" size={16} color={selectedType === 'livestock_management' ? "white" : "#FF9800"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'livestock_management' && styles.selectedFilterText
          ]}>Livestock</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'resource_optimization' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('resource_optimization')}
        >
          <IconSymbol name="drop.fill" size={16} color={selectedType === 'resource_optimization' ? "white" : "#2196F3"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'resource_optimization' && styles.selectedFilterText
          ]}>Resources</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'pest_prevention' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('pest_prevention')}
        >
          <IconSymbol name="ant.fill" size={16} color={selectedType === 'pest_prevention' ? "white" : "#F44336"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'pest_prevention' && styles.selectedFilterText
          ]}>Pest Prevention</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'disease_prevention' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('disease_prevention')}
        >
          <IconSymbol name="cross.case.fill" size={16} color={selectedType === 'disease_prevention' ? "white" : "#9C27B0"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'disease_prevention' && styles.selectedFilterText
          ]}>Disease Prevention</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedType === 'market_opportunity' && styles.selectedFilterChip
          ]}
          onPress={() => handleTypeFilter('market_opportunity')}
        >
          <IconSymbol name="chart.line.uptrend.xyaxis.fill" size={16} color={selectedType === 'market_opportunity' ? "white" : "#4CAF50"} />
          <ThemedText style={[
            styles.filterText,
            selectedType === 'market_opportunity' && styles.selectedFilterText
          ]}>Market Opportunity</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.recommendationsContainer}>
        {filteredRecommendations.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol name="exclamationmark.circle" size={48} color="#757575" />
            <ThemedText style={styles.emptyText}>
              No recommendations found for this category.
            </ThemedText>
          </ThemedView>
        ) : (
          filteredRecommendations.map(recommendation => (
            <AIRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onPress={handleRecommendationPress}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}
