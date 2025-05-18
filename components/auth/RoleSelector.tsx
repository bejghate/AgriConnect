import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserRole, ROLE_DEFINITIONS } from '@/types/user';

interface RoleSelectorProps {
  /**
   * The currently selected role
   */
  selectedRole: UserRole;
  
  /**
   * Callback when a role is selected
   */
  onSelectRole: (role: UserRole) => void;
  
  /**
   * Roles to exclude from the selector
   * Default: ['super_admin']
   */
  excludeRoles?: UserRole[];
}

/**
 * Component for selecting a user role
 */
export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
  excludeRoles = ['super_admin'],
}) => {
  const theme = useTheme();
  
  // Filter out excluded roles
  const availableRoles = Object.values(ROLE_DEFINITIONS).filter(
    role => !excludeRoles.includes(role.id)
  );
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {availableRoles.map(role => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleCard,
            selectedRole === role.id && { 
              borderColor: role.color,
              borderWidth: 2,
              backgroundColor: `${role.color}10`
            }
          ]}
          onPress={() => onSelectRole(role.id)}
          accessibilityLabel={`Select role: ${role.title}`}
          accessibilityRole="radio"
          accessibilityState={{ checked: selectedRole === role.id }}
        >
          <ThemedView style={[styles.iconContainer, { backgroundColor: role.color }]}>
            <IconSymbol name={role.icon} size={24} color="white" />
          </ThemedView>
          
          <ThemedText type="defaultSemiBold" style={styles.roleTitle}>
            {role.title}
          </ThemedText>
          
          <ThemedText style={styles.roleDescription} numberOfLines={2}>
            {role.description}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/**
 * Component for displaying detailed information about a role
 */
export const RoleDetails: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleInfo = ROLE_DEFINITIONS[role];
  
  if (!roleInfo) {
    return null;
  }
  
  return (
    <ThemedView style={styles.roleDetails}>
      <ThemedView style={[styles.roleHeaderContainer, { backgroundColor: roleInfo.color }]}>
        <IconSymbol name={roleInfo.icon} size={32} color="white" />
        <ThemedText type="subtitle" style={styles.roleHeaderTitle}>
          {roleInfo.title}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.roleDetailsContent}>
        <ThemedText style={styles.roleDetailsDescription}>
          {roleInfo.description}
        </ThemedText>
        
        <ThemedText type="defaultSemiBold" style={styles.permissionsTitle}>
          Permissions:
        </ThemedText>
        
        <ThemedView style={styles.permissionsList}>
          {roleInfo.permissions.map(permission => (
            <ThemedView key={permission} style={styles.permissionItem}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={roleInfo.color} />
              <ThemedText style={styles.permissionText}>
                {formatPermission(permission)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

// Helper function to format permission names for display
const formatPermission = (permission: string): string => {
  const [resource, action] = permission.split('.');
  
  const resourceMap: Record<string, string> = {
    'user': 'Utilisateurs',
    'content': 'Contenu',
    'system': 'Système',
    'stats': 'Statistiques',
    'profile': 'Profil',
    'consultation': 'Consultations',
    'marketplace': 'Marché',
    'order': 'Commandes',
    'buyer': 'Acheteurs',
    'encyclopedia': 'Encyclopédie',
    'expert': 'Experts',
    'farm': 'Ferme',
    'dashboard': 'Tableau de bord',
    'notification': 'Notifications',
    'dispute': 'Litiges',
    'report': 'Signalements',
    'finance': 'Finances',
    'credit': 'Crédit',
    'farmer': 'Agriculteurs',
    'training': 'Formations',
  };
  
  const actionMap: Record<string, string> = {
    'manage': 'Gérer',
    'view': 'Voir',
    'respond': 'Répondre',
    'publish': 'Publier',
    'message': 'Messagerie',
    'access': 'Accéder',
    'customize': 'Personnaliser',
    'validate': 'Valider',
    'resolve': 'Résoudre',
    'track': 'Suivre',
    'register': 'Enregistrer',
  };
  
  const resourceText = resourceMap[resource] || resource;
  const actionText = actionMap[action] || action;
  
  return `${actionText} ${resourceText}`;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  roleCard: {
    width: 150,
    height: 180,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    borderColor: 'transparent',
    borderWidth: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#757575',
  },
  roleDetails: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  roleHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  roleHeaderTitle: {
    color: 'white',
    marginLeft: 12,
  },
  roleDetailsContent: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  roleDetailsDescription: {
    marginBottom: 16,
  },
  permissionsTitle: {
    marginBottom: 8,
  },
  permissionsList: {
    marginLeft: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionText: {
    marginLeft: 8,
  },
});

export default RoleSelector;
