import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import { SeasonalAdvice } from '@/data/notifications';
import { Collapsible } from '@/components/Collapsible';

// Bullet list item component
const BulletListItem = ({ text }) => (
  <ThemedView style={styles.bulletItem}>
    <ThemedView style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

export default function SeasonalAdviceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { seasonalAdvice, markAsRead } = useNotifications();
  const { isOnline } = useOffline();
  const { userTypes, primaryUserType } = useUser();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [advice, setAdvice] = useState<SeasonalAdvice | null>(null);
  const [relatedAdvice, setRelatedAdvice] = useState<SeasonalAdvice[]>([]);
  
  // Load advice data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (id) {
        // Find the specific advice
        const foundAdvice = seasonalAdvice.find(a => a.id === id) as SeasonalAdvice;
        if (foundAdvice) {
          setAdvice(foundAdvice);
          markAsRead(foundAdvice.id);
          
          // Find related advice (same season or applicable crops/livestock)
          const related = seasonalAdvice.filter(a => 
            a.id !== id && 
            (a.season === foundAdvice.season || 
             (a.applicableCrops && foundAdvice.applicableCrops && 
              a.applicableCrops.some(crop => foundAdvice.applicableCrops!.includes(crop))) ||
             (a.applicableLivestock && foundAdvice.applicableLivestock && 
              a.applicableLivestock.some(livestock => foundAdvice.applicableLivestock!.includes(livestock)))
            )
          );
          setRelatedAdvice(related);
        }
      } else {
        // If no ID provided, show the most recent advice applicable to the user
        const applicableAdvice = seasonalAdvice.filter(a => 
          a.applicableUserTypes.some(type => userTypes.includes(type as any))
        );
        
        if (applicableAdvice.length > 0) {
          const mostRecent = applicableAdvice.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          setAdvice(mostRecent);
          markAsRead(mostRecent.id);
          
          // Find related advice
          const related = seasonalAdvice.filter(a => 
            a.id !== mostRecent.id && 
            (a.season === mostRecent.season || 
             (a.applicableCrops && mostRecent.applicableCrops && 
              a.applicableCrops.some(crop => mostRecent.applicableCrops!.includes(crop))) ||
             (a.applicableLivestock && mostRecent.applicableLivestock && 
              a.applicableLivestock.some(livestock => mostRecent.applicableLivestock!.includes(livestock)))
            )
          );
          setRelatedAdvice(related);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, seasonalAdvice, markAsRead, userTypes]);
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Navigate to another advice
  const navigateToAdvice = (adviceId: string) => {
    router.push(`/seasonal-advice?id=${adviceId}`);
  };
  
  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString(undefined, { 
      month: 'long', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString(undefined, { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  };
  
  // Get season icon
  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring':
        return 'leaf.fill';
      case 'summer':
        return 'sun.max.fill';
      case 'autumn':
        return 'leaf.arrow.triangle.circlepath';
      case 'winter':
        return 'snowflake';
      case 'rainy':
        return 'cloud.rain.fill';
      case 'dry':
        return 'sun.dust.fill';
      default:
        return 'calendar';
    }
  };
  
  // Share advice
  const shareAdvice = async () => {
    if (!advice) return;
    
    try {
      const result = await Share.share({
        title: advice.title,
        message: `${advice.title}\n\n${advice.description}\n\n${advice.tips.join('\n• ')}`,
      });
    } catch (error) {
      console.error('Error sharing advice:', error);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading seasonal advice...</ThemedText>
      </ThemedView>
    );
  }
  
  // No advice found
  if (!advice) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText type="subtitle" style={styles.errorTitle}>Advice Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The seasonal advice you're looking for could not be found. It may have been removed or is no longer relevant.
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Seasonal Advice</ThemedText>
        
        <TouchableOpacity style={styles.shareButton} onPress={shareAdvice}>
          <IconSymbol name="square.and.arrow.up" size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. This information may not be up to date.
          </ThemedText>
        </ThemedView>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.adviceHeader}>
          <ThemedView 
            style={[
              styles.seasonBadge, 
              { backgroundColor: advice.color || '#4CAF50' }
            ]}
          >
            <IconSymbol 
              name={advice.icon || getSeasonIcon(advice.season)} 
              size={16} 
              color="white" 
            />
            <ThemedText style={styles.seasonText}>
              {advice.season.charAt(0).toUpperCase() + advice.season.slice(1)} Season
            </ThemedText>
          </ThemedView>
          
          <ThemedText type="title" style={styles.adviceTitle}>{advice.title}</ThemedText>
          
          <ThemedText style={styles.adviceValidity}>
            Valid: {formatDateRange(advice.validFrom, advice.validTo)}
          </ThemedText>
        </ThemedView>
        
        {advice.imageUrl && (
          <Image
            source={{ uri: advice.imageUrl }}
            style={styles.adviceImage}
            contentFit="cover"
            placeholder={require('@/assets/images/react-logo.png')}
            transition={200}
          />
        )}
        
        <ThemedView style={styles.adviceCard}>
          <ThemedText style={styles.adviceDescription}>
            {advice.description}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recommended Actions</ThemedText>
          <ThemedView style={styles.tipsContainer}>
            {advice.tips.map((tip, index) => (
              <BulletListItem key={index} text={tip} />
            ))}
          </ThemedView>
        </ThemedView>
        
        {(advice.applicableCrops || advice.applicableLivestock) && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Applicable To</ThemedText>
            
            {advice.applicableCrops && advice.applicableCrops.length > 0 && (
              <ThemedView style={styles.applicableContainer}>
                <ThemedText type="defaultSemiBold" style={styles.applicableTitle}>
                  Crops:
                </ThemedText>
                <ThemedView style={styles.tagsContainer}>
                  {advice.applicableCrops.map((crop, index) => (
                    <ThemedView key={index} style={styles.tagBadge}>
                      <IconSymbol name="leaf.fill" size={14} color="#4CAF50" />
                      <ThemedText style={styles.tagText}>{crop}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            )}
            
            {advice.applicableLivestock && advice.applicableLivestock.length > 0 && (
              <ThemedView style={styles.applicableContainer}>
                <ThemedText type="defaultSemiBold" style={styles.applicableTitle}>
                  Livestock:
                </ThemedText>
                <ThemedView style={styles.tagsContainer}>
                  {advice.applicableLivestock.map((livestock, index) => (
                    <ThemedView key={index} style={styles.tagBadge}>
                      <IconSymbol name="pawprint.fill" size={14} color="#FF9800" />
                      <ThemedText style={styles.tagText}>{livestock}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
        )}
        
        {relatedAdvice.length > 0 && (
          <Collapsible title="Related Seasonal Advice">
            <ThemedView style={styles.relatedAdviceContainer}>
              {relatedAdvice.map((relatedItem) => (
                <TouchableOpacity 
                  key={relatedItem.id}
                  style={styles.relatedAdviceItem}
                  onPress={() => navigateToAdvice(relatedItem.id)}
                >
                  <ThemedView 
                    style={[
                      styles.relatedAdviceIcon, 
                      { backgroundColor: relatedItem.color || '#4CAF50' }
                    ]}
                  >
                    <IconSymbol 
                      name={relatedItem.icon || getSeasonIcon(relatedItem.season)} 
                      size={16} 
                      color="white" 
                    />
                  </ThemedView>
                  
                  <ThemedView style={styles.relatedAdviceContent}>
                    <ThemedText type="defaultSemiBold" style={styles.relatedAdviceTitle}>
                      {relatedItem.title}
                    </ThemedText>
                    <ThemedText style={styles.relatedAdviceSeason}>
                      {relatedItem.season.charAt(0).toUpperCase() + relatedItem.season.slice(1)} Season
                    </ThemedText>
                  </ThemedView>
                  
                  <IconSymbol name="chevron.right" size={16} color="#757575" />
                </TouchableOpacity>
              ))}
            </ThemedView>
          </Collapsible>
        )}
        
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => router.push('/calendar')}
        >
          <IconSymbol name="calendar" size={20} color="white" />
          <ThemedText style={styles.calendarButtonText}>
            View Agricultural Calendar
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  headerTitle: {
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
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
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  adviceHeader: {
    marginBottom: 16,
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  seasonText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
  adviceTitle: {
    marginBottom: 8,
  },
  adviceValidity: {
    color: '#757575',
    fontSize: 14,
  },
  adviceImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  adviceCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  adviceDescription: {
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  applicableContainer: {
    marginBottom: 16,
  },
  applicableTitle: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    marginLeft: 6,
  },
  relatedAdviceContainer: {
    gap: 12,
  },
  relatedAdviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  relatedAdviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedAdviceContent: {
    flex: 1,
  },
  relatedAdviceTitle: {
    marginBottom: 4,
  },
  relatedAdviceSeason: {
    fontSize: 12,
    color: '#757575',
  },
  calendarButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  calendarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
