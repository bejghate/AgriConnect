import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from '@/context/NotificationsContext';
import { useOffline } from '@/context/OfflineContext';
import { Collapsible } from '@/components/Collapsible';

// Bullet list item component
const BulletListItem = ({ text }) => (
  <ThemedView style={styles.bulletItem}>
    <ThemedView style={styles.bullet} />
    <ThemedText style={styles.bulletText}>{text}</ThemedText>
  </ThemedView>
);

// Step component
const Step = ({ number, title, description, isCompleted, onComplete }) => (
  <ThemedView style={[styles.stepContainer, isCompleted && styles.completedStep]}>
    <ThemedView style={styles.stepHeader}>
      <ThemedView style={[styles.stepNumber, isCompleted && styles.completedStepNumber]}>
        {isCompleted ? (
          <IconSymbol name="checkmark" size={16} color="white" />
        ) : (
          <ThemedText style={styles.stepNumberText}>{number}</ThemedText>
        )}
      </ThemedView>
      
      <ThemedText type="defaultSemiBold" style={styles.stepTitle}>
        {title}
      </ThemedText>
      
      {!isCompleted && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <ThemedText style={styles.completeButtonText}>Mark as Done</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
    
    <ThemedText style={styles.stepDescription}>{description}</ThemedText>
  </ThemedView>
);

export default function LocustInvasionExampleScreen() {
  const router = useRouter();
  const { urgentAlerts } = useNotifications();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locustAlert, setLocustAlert] = useState<any | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  // Load alert data
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the locust alert
      const alert = urgentAlerts.find(a => a.alertType === 'pest' && a.title.includes('Locust'));
      setLocustAlert(alert || {
        id: 'example-locust-alert',
        title: 'Locust Swarm Approaching',
        description: 'A large swarm of desert locusts has been spotted 100km from your location, moving in your direction. Prepare your crops for potential damage.',
        alertType: 'pest',
        alertTitle: 'Desert Locust Swarm',
        location: {
          region: 'Eastern',
          coordinates: {
            latitude: 12.5383,
            longitude: 1.8616,
          },
          radius: 100,
        },
        source: 'National Pest Monitoring Service',
        reportedDate: new Date().toISOString(),
        recommendedActions: [
          'Harvest mature crops immediately if possible',
          'Apply recommended pesticides to protect remaining crops',
          'Cover young plants with netting if available',
          'Coordinate with neighboring farmers for collective action',
          'Report sightings to agricultural authorities'
        ],
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, [urgentAlerts]);
  
  // Mark a step as completed
  const completeStep = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      const newCompletedSteps = [...completedSteps, stepNumber];
      setCompletedSteps(newCompletedSteps);
      
      // If all steps are completed, show success message
      if (newCompletedSteps.length === 5) {
        setShowSuccess(true);
      }
    }
  };
  
  // Navigate back
  const navigateBack = () => {
    router.back();
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
        <ThemedText style={styles.loadingText}>Loading example...</ThemedText>
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Locust Invasion Example</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.scenarioCard}>
          <ThemedText type="subtitle" style={styles.scenarioTitle}>
            Example Scenario
          </ThemedText>
          
          <ThemedText style={styles.scenarioDescription}>
            You have received an urgent alert about a locust swarm approaching your area. 
            This example demonstrates how you would use the app to respond to this situation.
          </ThemedText>
          
          <ThemedView style={styles.alertPreview}>
            <ThemedView style={styles.alertHeader}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#F44336" />
              <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
                {locustAlert.title}
              </ThemedText>
            </ThemedView>
            
            <ThemedText style={styles.alertDescription}>
              {locustAlert.description}
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.viewAlertButton}
              onPress={() => router.push('/urgent-alerts')}
            >
              <ThemedText style={styles.viewAlertButtonText}>
                View Alert Details
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        {showSuccess ? (
          <ThemedView style={styles.successCard}>
            <IconSymbol name="checkmark.circle.fill" size={48} color="#4CAF50" />
            <ThemedText type="subtitle" style={styles.successTitle}>
              Great job!
            </ThemedText>
            <ThemedText style={styles.successDescription}>
              You've completed all the recommended actions to protect your farm from the locust invasion.
              This proactive approach will help minimize damage to your crops.
            </ThemedText>
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={navigateBack}
            >
              <ThemedText style={styles.doneButtonText}>
                Done
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recommended Actions
            </ThemedText>
            
            <ThemedText style={styles.sectionDescription}>
              Based on the alert, here are the steps you should take to protect your farm:
            </ThemedText>
            
            <Step
              number={1}
              title="Harvest Mature Crops"
              description="Identify and harvest any crops that are mature enough to be collected. This will minimize potential losses from the locust swarm."
              isCompleted={completedSteps.includes(1)}
              onComplete={() => completeStep(1)}
            />
            
            <Step
              number={2}
              title="Apply Pesticides"
              description="Apply appropriate pesticides to your remaining crops. Consult the Agricultural Encyclopedia for recommended pesticides for locust control."
              isCompleted={completedSteps.includes(2)}
              onComplete={() => completeStep(2)}
            />
            
            <Step
              number={3}
              title="Cover Young Plants"
              description="Use netting or other protective coverings for young, vulnerable plants that cannot be harvested yet."
              isCompleted={completedSteps.includes(3)}
              onComplete={() => completeStep(3)}
            />
            
            <Step
              number={4}
              title="Coordinate with Neighbors"
              description="Contact neighboring farmers to coordinate a collective response. Use the app's messaging feature to connect with other farmers in your area."
              isCompleted={completedSteps.includes(4)}
              onComplete={() => completeStep(4)}
            />
            
            <Step
              number={5}
              title="Report to Authorities"
              description="Report locust sightings to agricultural authorities to help them track the swarm's movement and provide assistance."
              isCompleted={completedSteps.includes(5)}
              onComplete={() => completeStep(5)}
            />
          </>
        )}
        
        <Collapsible title="Additional Resources">
          <ThemedView style={styles.resourcesContainer}>
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Alert.alert('Encyclopedia', 'This would open the Agricultural Encyclopedia entry on locusts and pest control.')}
            >
              <IconSymbol name="book.fill" size={20} color="#0a7ea4" />
              <ThemedText style={styles.resourceText}>
                Locust Control in the Agricultural Encyclopedia
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Alert.alert('Marketplace', 'This would open the Marketplace filtered for pest control products.')}
            >
              <IconSymbol name="cart.fill" size={20} color="#4CAF50" />
              <ThemedText style={styles.resourceText}>
                Pest Control Products in Marketplace
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.resourceItem}
              onPress={() => Alert.alert('Expert Consultation', 'This would connect you with an agricultural expert for advice on locust control.')}
            >
              <IconSymbol name="person.fill.badge.plus" size={20} color="#2196F3" />
              <ThemedText style={styles.resourceText}>
                Consult an Expert on Pest Control
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Collapsible>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scenarioCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  scenarioTitle: {
    marginBottom: 8,
  },
  scenarioDescription: {
    marginBottom: 16,
    lineHeight: 22,
  },
  alertPreview: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    marginLeft: 8,
    color: '#F44336',
  },
  alertDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  viewAlertButton: {
    backgroundColor: '#F44336',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  viewAlertButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    marginBottom: 16,
    color: '#757575',
  },
  stepContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  completedStep: {
    borderLeftColor: '#4CAF50',
    opacity: 0.8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedStepNumber: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTitle: {
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  stepDescription: {
    lineHeight: 20,
    color: '#757575',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a7ea4',
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  resourceText: {
    marginLeft: 12,
    flex: 1,
  },
  successCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#4CAF50',
  },
  successDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
