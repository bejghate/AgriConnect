import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { HealthAlert } from '@/data/notifications';
import { Collapsible } from '@/components/Collapsible';

// Bullet list item component
const BulletListItem = ({ text }) => (
  <ThemedView style={styles.bulletItem}>
    <ThemedView style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

export default function HealthAlertsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { healthAlerts, markAsRead } = useNotifications();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<HealthAlert | null>(null);
  const [relatedAlerts, setRelatedAlerts] = useState<HealthAlert[]>([]);
  
  // Load alert data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (id) {
        // Find the specific alert
        const foundAlert = healthAlerts.find(a => a.id === id) as HealthAlert;
        if (foundAlert) {
          setAlert(foundAlert);
          markAsRead(foundAlert.id);
          
          // Find related alerts (same disease or affected species)
          const related = healthAlerts.filter(a => 
            a.id !== id && 
            (a.diseaseName === foundAlert.diseaseName || 
             a.affectedSpecies.some(species => 
               foundAlert.affectedSpecies.includes(species)
             ))
          );
          setRelatedAlerts(related);
        }
      } else {
        // If no ID provided, show the most recent alert
        if (healthAlerts.length > 0) {
          const mostRecent = healthAlerts.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          setAlert(mostRecent);
          markAsRead(mostRecent.id);
          
          // Find related alerts
          const related = healthAlerts.filter(a => 
            a.id !== mostRecent.id && 
            (a.diseaseName === mostRecent.diseaseName || 
             a.affectedSpecies.some(species => 
               mostRecent.affectedSpecies.includes(species)
             ))
          );
          setRelatedAlerts(related);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, healthAlerts, markAsRead]);
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Navigate to encyclopedia
  const navigateToEncyclopedia = (path: string) => {
    if (path) {
      router.push(`/${path}`);
    }
  };
  
  // Navigate to another alert
  const navigateToAlert = (alertId: string) => {
    router.push(`/health-alerts?id=${alertId}`);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading health alert...</ThemedText>
      </ThemedView>
    );
  }
  
  // No alert found
  if (!alert) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText type="subtitle" style={styles.errorTitle}>Alert Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The health alert you're looking for could not be found. It may have been removed or is no longer relevant.
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Health Alert</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
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
        <ThemedView style={styles.alertHeader}>
          <ThemedView 
            style={[
              styles.severityBadge, 
              { backgroundColor: alert.priority === 'high' ? '#F44336' : 
                                alert.priority === 'medium' ? '#FF9800' : '#4CAF50' }
            ]}
          >
            <ThemedText style={styles.severityText}>
              {alert.priority.toUpperCase()} PRIORITY
            </ThemedText>
          </ThemedView>
          
          <ThemedText type="title" style={styles.alertTitle}>{alert.title}</ThemedText>
          
          <ThemedText style={styles.alertDate}>
            Reported on {formatDate(alert.reportedDate)}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.alertCard}>
          <ThemedView style={styles.alertCardHeader}>
            <ThemedView 
              style={[
                styles.alertIcon, 
                { backgroundColor: alert.color || '#F44336' }
              ]}
            >
              <IconSymbol 
                name={alert.icon || 'exclamationmark.triangle.fill'} 
                size={24} 
                color="white" 
              />
            </ThemedView>
            
            <ThemedView style={styles.alertCardHeaderText}>
              <ThemedText type="defaultSemiBold" style={styles.diseaseName}>
                {alert.diseaseName}
              </ThemedText>
              <ThemedText style={styles.diseaseType}>
                {alert.diseaseType === 'plant' ? 'Plant Disease' : 'Animal Disease'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.alertDescription}>
            {alert.description}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Affected Species</ThemedText>
          <ThemedView style={styles.speciesContainer}>
            {alert.affectedSpecies.map((species, index) => (
              <ThemedView key={index} style={styles.speciesBadge}>
                <IconSymbol 
                  name={alert.diseaseType === 'plant' ? 'leaf.fill' : 'pawprint.fill'} 
                  size={14} 
                  color="#0a7ea4" 
                />
                <ThemedText style={styles.speciesText}>{species}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Location</ThemedText>
          <ThemedView style={styles.locationCard}>
            <ThemedView style={styles.locationHeader}>
              <IconSymbol name="mappin.circle.fill" size={20} color="#F44336" />
              <ThemedText type="defaultSemiBold" style={styles.locationRegion}>
                {alert.location.region}
                {alert.location.city && `, ${alert.location.city}`}
              </ThemedText>
            </ThemedView>
            
            {alert.location.radius && (
              <ThemedText style={styles.locationRadius}>
                Affected area: {alert.location.radius} km radius
              </ThemedText>
            )}
            
            {/* Placeholder for map - in a real app, this would be a map component */}
            <ThemedView style={styles.mapPlaceholder}>
              <IconSymbol name="map.fill" size={32} color="#757575" />
              <ThemedText style={styles.mapPlaceholderText}>Map View</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recommended Actions</ThemedText>
          <ThemedView style={styles.actionsContainer}>
            {alert.recommendedActions.map((action, index) => (
              <BulletListItem key={index} text={action} />
            ))}
          </ThemedView>
        </ThemedView>
        
        {alert.linkToInfo && (
          <TouchableOpacity 
            style={styles.encyclopediaButton}
            onPress={() => navigateToEncyclopedia(alert.linkToInfo!)}
          >
            <IconSymbol name="book.fill" size={20} color="white" />
            <ThemedText style={styles.encyclopediaButtonText}>
              View in Encyclopedia
            </ThemedText>
          </TouchableOpacity>
        )}
        
        {relatedAlerts.length > 0 && (
          <Collapsible title="Related Health Alerts">
            <ThemedView style={styles.relatedAlertsContainer}>
              {relatedAlerts.map((relatedAlert) => (
                <TouchableOpacity 
                  key={relatedAlert.id}
                  style={styles.relatedAlertItem}
                  onPress={() => navigateToAlert(relatedAlert.id)}
                >
                  <ThemedView 
                    style={[
                      styles.relatedAlertIcon, 
                      { backgroundColor: relatedAlert.color || '#F44336' }
                    ]}
                  >
                    <IconSymbol 
                      name={relatedAlert.icon || 'exclamationmark.triangle.fill'} 
                      size={16} 
                      color="white" 
                    />
                  </ThemedView>
                  
                  <ThemedView style={styles.relatedAlertContent}>
                    <ThemedText type="defaultSemiBold" style={styles.relatedAlertTitle}>
                      {relatedAlert.title}
                    </ThemedText>
                    <ThemedText style={styles.relatedAlertDate}>
                      {formatDate(relatedAlert.reportedDate)}
                    </ThemedText>
                  </ThemedView>
                  
                  <IconSymbol name="chevron.right" size={16} color="#757575" />
                </TouchableOpacity>
              ))}
            </ThemedView>
          </Collapsible>
        )}
        
        <ThemedView style={styles.sourceContainer}>
          <ThemedText style={styles.sourceText}>
            Source: {alert.source}
          </ThemedText>
        </ThemedView>
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
  alertHeader: {
    marginBottom: 16,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertTitle: {
    marginBottom: 8,
  },
  alertDate: {
    color: '#757575',
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertCardHeaderText: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    marginBottom: 4,
  },
  diseaseType: {
    color: '#757575',
    fontSize: 14,
  },
  alertDescription: {
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  speciesText: {
    marginLeft: 6,
    color: '#0a7ea4',
  },
  locationCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationRegion: {
    marginLeft: 8,
    fontSize: 16,
  },
  locationRadius: {
    color: '#757575',
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    color: '#757575',
  },
  actionsContainer: {
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
  encyclopediaButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 24,
  },
  encyclopediaButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  relatedAlertsContainer: {
    gap: 12,
  },
  relatedAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  relatedAlertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedAlertContent: {
    flex: 1,
  },
  relatedAlertTitle: {
    marginBottom: 4,
  },
  relatedAlertDate: {
    fontSize: 12,
    color: '#757575',
  },
  sourceContainer: {
    marginTop: 8,
  },
  sourceText: {
    fontStyle: 'italic',
    color: '#757575',
    fontSize: 14,
  },
});
