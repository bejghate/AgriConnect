import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Badge, Divider } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/navigation/AppHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useExpertGuard } from '@/hooks/usePermissionGuard';
import { useUser } from '@/context/UserContext';
import { RoleBasedAccess } from '@/components/auth/RoleBasedAccess';

/**
 * Expert Dashboard - Only accessible to Experts and Super Administrators
 */
export default function ExpertDashboardScreen() {
  const router = useRouter();
  const { hasAccess } = useExpertGuard();
  const { user, roles, primaryRole, hasPermission } = useUser();
  
  // If access is denied, the hook will redirect automatically
  if (!hasAccess) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Checking permissions...</ThemedText>
      </ThemedView>
    );
  }
  
  const navigateTo = (route: string) => {
    router.push(route);
  };
  
  // Mock data for consultations
  const pendingConsultations = [
    { id: '1', farmer: 'Amadou Diallo', topic: 'Tomato Disease', date: '2023-06-15', status: 'pending' },
    { id: '2', farmer: 'Fatima Sow', topic: 'Cattle Vaccination', date: '2023-06-14', status: 'pending' },
    { id: '3', farmer: 'Ibrahim Keita', topic: 'Soil Analysis', date: '2023-06-13', status: 'pending' },
  ];
  
  // Mock data for content
  const draftContent = [
    { id: '1', title: 'Preventing Tomato Blight', category: 'Diseases', lastEdited: '2023-06-10' },
    { id: '2', title: 'Cattle Vaccination Schedule', category: 'Livestock', lastEdited: '2023-06-08' },
  ];
  
  return (
    <ThemedView style={styles.container}>
      <AppHeader
        title="Expert Dashboard"
        showBack
        showMenu={false}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title">Welcome, {user?.fullName}</ThemedText>
          <ThemedText>Agricultural Expert</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statValue}>24</ThemedText>
            <ThemedText style={styles.statLabel}>Consultations</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statValue}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Articles</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.statCard}>
            <ThemedText type="title" style={styles.statValue}>4.8</ThemedText>
            <ThemedText style={styles.statLabel}>Rating</ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Pending Consultations
        </ThemedText>
        
        <RoleBasedAccess requiredPermissions={['consultation.respond']}>
          <ThemedView style={styles.consultationsContainer}>
            {pendingConsultations.map(consultation => (
              <TouchableOpacity
                key={consultation.id}
                style={styles.consultationItem}
                onPress={() => navigateTo(`/expert/consultations/${consultation.id}`)}
              >
                <ThemedView style={styles.consultationHeader}>
                  <ThemedText type="defaultSemiBold">{consultation.farmer}</ThemedText>
                  <Badge style={styles.statusBadge}>New</Badge>
                </ThemedView>
                
                <ThemedText style={styles.consultationTopic}>{consultation.topic}</ThemedText>
                
                <ThemedView style={styles.consultationFooter}>
                  <ThemedText style={styles.consultationDate}>{consultation.date}</ThemedText>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => navigateTo(`/expert/consultations/${consultation.id}`)}
                  >
                    Respond
                  </Button>
                </ThemedView>
              </TouchableOpacity>
            ))}
            
            <Button
              mode="outlined"
              style={styles.viewAllButton}
              onPress={() => navigateTo('/expert/consultations')}
            >
              View All Consultations
            </Button>
          </ThemedView>
        </RoleBasedAccess>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Content Management
        </ThemedText>
        
        <RoleBasedAccess requiredPermissions={['content.publish']}>
          <Card style={styles.contentCard}>
            <Card.Content>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Draft Content
              </ThemedText>
              
              {draftContent.map((content, index) => (
                <React.Fragment key={content.id}>
                  <TouchableOpacity
                    style={styles.contentItem}
                    onPress={() => navigateTo(`/expert/content/${content.id}`)}
                  >
                    <ThemedView>
                      <ThemedText type="defaultSemiBold">{content.title}</ThemedText>
                      <ThemedText style={styles.contentCategory}>{content.category}</ThemedText>
                    </ThemedView>
                    
                    <ThemedView style={styles.contentActions}>
                      <ThemedText style={styles.contentDate}>
                        Last edited: {content.lastEdited}
                      </ThemedText>
                      <IconSymbol name="chevron.right" size={16} color="#757575" />
                    </ThemedView>
                  </TouchableOpacity>
                  
                  {index < draftContent.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card.Content>
            
            <Card.Actions>
              <Button onPress={() => navigateTo('/expert/content/new')}>
                Create New Content
              </Button>
              <Button onPress={() => navigateTo('/expert/content')}>
                View All
              </Button>
            </Card.Actions>
          </Card>
        </RoleBasedAccess>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>
        
        <ThemedView style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/expert/schedule')}
          >
            <IconSymbol name="calendar" size={24} color="#2196F3" />
            <ThemedText style={styles.quickActionText}>My Schedule</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/expert/profile')}
          >
            <IconSymbol name="person.crop.circle" size={24} color="#4CAF50" />
            <ThemedText style={styles.quickActionText}>Edit Profile</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/expert/analytics')}
          >
            <IconSymbol name="chart.bar" size={24} color="#FF9800" />
            <ThemedText style={styles.quickActionText}>Analytics</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigateTo('/expert/settings')}
          >
            <IconSymbol name="gear" size={24} color="#9C27B0" />
            <ThemedText style={styles.quickActionText}>Settings</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  consultationsContainer: {
    marginBottom: 24,
  },
  consultationItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#2196F3',
  },
  consultationTopic: {
    marginBottom: 12,
  },
  consultationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consultationDate: {
    fontSize: 12,
    color: '#757575',
  },
  viewAllButton: {
    marginTop: 8,
  },
  contentCard: {
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 16,
  },
  contentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contentCategory: {
    fontSize: 12,
    color: '#757575',
  },
  contentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentDate: {
    fontSize: 12,
    color: '#757575',
    marginRight: 8,
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  quickActionText: {
    marginTop: 8,
  },
});
