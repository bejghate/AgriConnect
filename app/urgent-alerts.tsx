import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { UrgentAlert } from '@/data/notifications';
import { Collapsible } from '@/components/Collapsible';

// Bullet list item component
const BulletListItem = ({ text }) => (
  <ThemedView style={styles.bulletItem}>
    <ThemedView style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

export default function UrgentAlertsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { urgentAlerts, markAsRead } = useNotifications();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<UrgentAlert | null>(null);
  const [relatedAlerts, setRelatedAlerts] = useState<UrgentAlert[]>([]);
  
  // Load alert data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (id) {
        // Find the specific alert
        const foundAlert = urgentAlerts.find(a => a.id === id) as UrgentAlert;
        if (foundAlert) {
          setAlert(foundAlert);
          markAsRead(foundAlert.id);
          
          // Find related alerts (same alert type)
          const related = urgentAlerts.filter(a => 
            a.id !== id && a.alertType === foundAlert.alertType
          );
          setRelatedAlerts(related);
        }
      } else {
        // If no ID provided, show the most recent alert
        if (urgentAlerts.length > 0) {
          const mostRecent = urgentAlerts.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          setAlert(mostRecent);
          markAsRead(mostRecent.id);
          
          // Find related alerts
          const related = urgentAlerts.filter(a => 
            a.id !== mostRecent.id && a.alertType === mostRecent.alertType
          );
          setRelatedAlerts(related);
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, urgentAlerts, markAsRead]);
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Navigate to another alert
  const navigateToAlert = (alertId: string) => {
    router.push(`/urgent-alerts?id=${alertId}`);
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
  
  // Share alert
  const shareAlert = async () => {
    if (!alert) return;
    
    try {
      const result = await Share.share({
        title: `URGENT: ${alert.title}`,
        message: `URGENT ALERT: ${alert.title}\n\n${alert.description}\n\nReported on: ${formatDate(alert.reportedDate)}\n\nRecommended actions:\n${alert.recommendedActions.map(action => `• ${action}`).join('\n')}\n\nSource: ${alert.source}`,
      });
    } catch (error) {
      console.error('Error sharing alert:', error);
    }
  };
  
  // Get alert type icon
  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'weather':
        return 'cloud.bolt.rain.fill';
      case 'disease':
        return 'allergens';
      case 'pest':
        return 'ladybug.fill';
      default:
        return 'exclamationmark.triangle.fill';
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading urgent alert...</ThemedText>
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
          The urgent alert you're looking for could not be found. It may have been removed or is no longer relevant.
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Urgent Alert</ThemedText>
        
        <TouchableOpacity style={styles.shareButton} onPress={shareAlert}>
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
        <ThemedView style={styles.alertBanner}>
          <ThemedView style={styles.alertBannerContent}>
            <IconSymbol name="exclamationmark.triangle.fill" size={24} color="white" />
            <ThemedText style={styles.alertBannerText}>URGENT ALERT</ThemedText>
          </ThemedView>
          <ThemedText style={styles.alertExpiry}>
            Expires: {formatDate(alert.expiresAt)}
          </ThemedText>
        </ThemedView>
        
        <ThemedText type="title" style={styles.alertTitle}>{alert.title}</ThemedText>
        
        <ThemedText style={styles.alertDate}>
          Reported on {formatDate(alert.reportedDate)}
        </ThemedText>
        
        {alert.imageUrl && (
          <Image
            source={{ uri: alert.imageUrl }}
            style={styles.alertImage}
            contentFit="cover"
            placeholder={require('@/assets/images/react-logo.png')}
            transition={200}
          />
        )}
        
        <ThemedView style={styles.alertCard}>
          <ThemedView style={styles.alertCardHeader}>
            <ThemedView 
              style={[
                styles.alertTypeIcon, 
                { backgroundColor: alert.color || '#F44336' }
              ]}
            >
              <IconSymbol 
                name={getAlertTypeIcon(alert.alertType)} 
                size={24} 
                color="white" 
              />
            </ThemedView>
            
            <ThemedView style={styles.alertCardHeaderText}>
              <ThemedText type="defaultSemiBold" style={styles.alertTypeTitle}>
                {alert.alertTitle}
              </ThemedText>
              <ThemedText style={styles.alertTypeSubtitle}>
                {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)} Alert
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.alertDescription}>
            {alert.description}
          </ThemedText>
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
        
        {relatedAlerts.length > 0 && (
          <Collapsible title="Related Alerts">
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
                      name={getAlertTypeIcon(relatedAlert.alertType)} 
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
        
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => Alert.alert(
            'Emergency Contact',
            'In case of emergency, contact the National Agricultural Emergency Service at +226 70 00 00 00'
          )}
        >
          <IconSymbol name="phone.fill" size={20} color="white" />
          <ThemedText style={styles.emergencyButtonText}>
            Emergency Contact
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
  alertBanner: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertBannerText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  alertExpiry: {
    color: 'white',
    fontSize: 12,
  },
  alertTitle: {
    marginBottom: 8,
  },
  alertDate: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 16,
  },
  alertImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
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
  alertTypeIcon: {
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
  alertTypeTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  alertTypeSubtitle: {
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
    backgroundColor: '#F44336',
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
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
    marginBottom: 24,
  },
  sourceText: {
    fontStyle: 'italic',
    color: '#757575',
    fontSize: 14,
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
