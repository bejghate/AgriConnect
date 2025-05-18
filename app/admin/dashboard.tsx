import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppHeader } from '@/components/navigation/AppHeader';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSuperAdminGuard } from '@/hooks/usePermissionGuard';
import { useUser } from '@/context/UserContext';
import { ROLE_DEFINITIONS, UserRole } from '@/types/user';

/**
 * Admin Dashboard - Only accessible to Super Administrators
 */
export default function AdminDashboardScreen() {
  const router = useRouter();
  const { hasAccess } = useSuperAdminGuard();
  const { user, roles, primaryRole } = useUser();
  
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
  
  return (
    <ThemedView style={styles.container}>
      <AppHeader
        title="Admin Dashboard"
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
          <ThemedText>Super Administrator</ThemedText>
        </ThemedView>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          System Management
        </ThemedText>
        
        <ThemedView style={styles.cardsContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <IconSymbol name="person.3.fill" size={32} color="#2196F3" style={styles.cardIcon} />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>User Management</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Manage users, roles, and permissions
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigateTo('/admin/users')}>Manage Users</Button>
            </Card.Actions>
          </Card>
          
          <Card style={styles.card}>
            <Card.Content>
              <IconSymbol name="shield.fill" size={32} color="#4CAF50" style={styles.cardIcon} />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Role Management</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Configure roles and their permissions
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigateTo('/admin/roles')}>Manage Roles</Button>
            </Card.Actions>
          </Card>
          
          <Card style={styles.card}>
            <Card.Content>
              <IconSymbol name="doc.text.fill" size={32} color="#FF9800" style={styles.cardIcon} />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Content Management</ThemedText>
              <ThemedText style={styles.cardDescription}>
                Manage encyclopedia and other content
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigateTo('/admin/content')}>Manage Content</Button>
            </Card.Actions>
          </Card>
          
          <Card style={styles.card}>
            <Card.Content>
              <IconSymbol name="chart.bar.fill" size={32} color="#9C27B0" style={styles.cardIcon} />
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Analytics</ThemedText>
              <ThemedText style={styles.cardDescription}>
                View system analytics and reports
              </ThemedText>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigateTo('/admin/analytics')}>View Analytics</Button>
            </Card.Actions>
          </Card>
        </ThemedView>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          System Information
        </ThemedText>
        
        <Card style={styles.infoCard}>
          <Card.Content>
            <ThemedView style={styles.infoRow}>
              <ThemedText type="defaultSemiBold">App Version:</ThemedText>
              <ThemedText>1.0.0</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText type="defaultSemiBold">Database Status:</ThemedText>
              <ThemedView style={styles.statusBadge}>
                <ThemedText style={styles.statusText}>Online</ThemedText>
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText type="defaultSemiBold">Last Backup:</ThemedText>
              <ThemedText>Today, 03:00 AM</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText type="defaultSemiBold">Active Users:</ThemedText>
              <ThemedText>1,245</ThemedText>
            </ThemedView>
          </Card.Content>
        </Card>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Available Roles
        </ThemedText>
        
        <ThemedView style={styles.rolesContainer}>
          {Object.entries(ROLE_DEFINITIONS).map(([key, role]) => (
            <ThemedView key={key} style={styles.roleItem}>
              <ThemedView style={[styles.roleIcon, { backgroundColor: role.color }]}>
                <IconSymbol name={role.icon} size={20} color="white" />
              </ThemedView>
              <ThemedView style={styles.roleInfo}>
                <ThemedText type="defaultSemiBold">{role.title}</ThemedText>
                <ThemedText style={styles.roleDescription} numberOfLines={1}>
                  {role.description}
                </ThemedText>
              </ThemedView>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigateTo(`/admin/roles/${key}`)}
              >
                <IconSymbol name="pencil" size={16} color="#2196F3" />
              </TouchableOpacity>
            </ThemedView>
          ))}
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
  sectionTitle: {
    marginBottom: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    marginBottom: 16,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#757575',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  rolesContainer: {
    marginBottom: 24,
  },
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleDescription: {
    fontSize: 12,
    color: '#757575',
  },
  editButton: {
    padding: 8,
  },
});
