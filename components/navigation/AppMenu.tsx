import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Drawer, Divider, Avatar, useTheme } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotifications } from '@/context/NotificationsContext';
import { COLORS } from '@/constants/Theme';

interface AppMenuProps {
  onClose: () => void;
  visible: boolean;
}

export const AppMenu: React.FC<AppMenuProps> = ({ onClose, visible }) => {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, user } = useAppStore();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotifications();
  const [active, setActive] = useState('');

  // Fonction pour naviguer vers une route
  const navigateTo = (route: string) => {
    router.push(route);
    setActive(route);
    onClose();
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    await logout();
    onClose();
    router.replace('/');
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: string) => {
    if (!isAuthenticated || !user) return false;
    return user.userTypes.includes(role) || user.primaryUserType === role;
  };

  return (
    <ThemedView style={[styles.container, !visible && styles.hidden]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête du menu */}
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Fermer le menu">
            <IconSymbol name="xmark" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>

          {isAuthenticated && user ? (
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => navigateTo('/profile')}
              accessibilityLabel="Voir votre profil"
            >
              <Avatar.Image
                size={60}
                source={
                  user.profileImage
                    ? { uri: user.profileImage }
                    : require('@/assets/images/default-avatar.png')
                }
              />
              <ThemedView style={styles.profileInfo}>
                <ThemedText type="subtitle" style={styles.userName}>
                  {user.fullName}
                </ThemedText>
                <ThemedText style={styles.userType}>
                  {user.primaryUserType === 'farmer' ? 'Agriculteur' :
                   user.primaryUserType === 'livestock' ? 'Éleveur' :
                   user.primaryUserType === 'agronomist' ? 'Agronome' :
                   user.primaryUserType === 'veterinarian' ? 'Vétérinaire' :
                   user.primaryUserType === 'supplier' ? 'Fournisseur' :
                   user.primaryUserType === 'buyer' ? 'Acheteur' : 'Utilisateur'}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigateTo('/login')}
              accessibilityLabel="Se connecter"
            >
              <IconSymbol name="person.circle" size={24} color={COLORS.primary.main} />
              <ThemedText style={styles.loginText}>Se connecter</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        <Divider style={styles.divider} />

        {/* Menu principal */}
        <Drawer.Section title="Menu principal" accessibilityLabel="Menu principal">
          <Drawer.Item
            label="Accueil"
            icon={({ color }) => <IconSymbol name="house" size={24} color={color} />}
            active={active === '/'}
            onPress={() => navigateTo('/')}
            accessibilityLabel="Accueil"
          />

          <Drawer.Item
            label="Encyclopédie agricole"
            icon={({ color }) => <IconSymbol name="book" size={24} color={color} />}
            active={active === '/encyclopedia'}
            onPress={() => navigateTo('/encyclopedia')}
            accessibilityLabel="Encyclopédie agricole"
          />

          <Drawer.Item
            label="Marketplace"
            icon={({ color }) => <IconSymbol name="cart" size={24} color={color} />}
            active={active === '/marketplace'}
            onPress={() => navigateTo('/marketplace')}
            accessibilityLabel="Marketplace"
          />

          {isAuthenticated && (
            <Drawer.Item
              label="Gestion d'exploitation"
              icon={({ color }) => <IconSymbol name="chart.bar" size={24} color={color} />}
              active={active === '/farm-management'}
              onPress={() => navigateTo('/farm-management')}
              accessibilityLabel="Gestion d'exploitation"
            />
          )}

          <Drawer.Item
            label="Notifications"
            icon={({ color }) => <IconSymbol name="bell" size={24} color={color} />}
            active={active === '/notifications'}
            onPress={() => navigateTo('/notifications')}
            right={() => unreadCount > 0 ? (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</ThemedText>
              </View>
            ) : null}
            accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
          />
        </Drawer.Section>

        <Divider style={styles.divider} />

        {/* Fonctionnalités spécifiques aux utilisateurs authentifiés */}
        {isAuthenticated && (
          <>
            <Drawer.Section title="Mes services" accessibilityLabel="Mes services">
              {(hasRole('farmer') || hasRole('livestock')) && (
                <Drawer.Item
                  label="Calendrier agricole"
                  icon={({ color }) => <IconSymbol name="calendar" size={24} color={color} />}
                  active={active === '/calendar'}
                  onPress={() => navigateTo('/calendar')}
                  accessibilityLabel="Calendrier agricole"
                />
              )}

              {(hasRole('agronomist') || hasRole('veterinarian')) && (
                <Drawer.Item
                  label="Mes consultations"
                  icon={({ color }) => <IconSymbol name="stethoscope" size={24} color={color} />}
                  active={active === '/consultations'}
                  onPress={() => navigateTo('/consultations')}
                  accessibilityLabel="Mes consultations"
                />
              )}

              {(hasRole('supplier') || hasRole('buyer')) && (
                <Drawer.Item
                  label="Mes produits"
                  icon={({ color }) => <IconSymbol name="tag" size={24} color={color} />}
                  active={active === '/my-products'}
                  onPress={() => navigateTo('/my-products')}
                  accessibilityLabel="Mes produits"
                />
              )}
            </Drawer.Section>

            <Divider style={styles.divider} />
          </>
        )}

        {/* Settings and Help */}
        <Drawer.Section title="Settings and Help" accessibilityLabel="Settings and Help">
          <Drawer.Item
            label="Paramètres"
            icon={({ color }) => <IconSymbol name="gear" size={24} color={color} />}
            active={active === '/settings'}
            onPress={() => navigateTo('/settings')}
            accessibilityLabel="Paramètres"
          />

          <Drawer.Item
            label="Contenu hors ligne"
            icon={({ color }) => <IconSymbol name="arrow.down.circle" size={24} color={color} />}
            active={active === '/offline-content'}
            onPress={() => navigateTo('/offline-content')}
            accessibilityLabel="Contenu hors ligne"
          />

          <Drawer.Item
            label="Aide et support"
            icon={({ color }) => <IconSymbol name="questionmark.circle" size={24} color={color} />}
            active={active === '/help'}
            onPress={() => navigateTo('/help')}
            accessibilityLabel="Aide et support"
          />

          <Drawer.Item
            label="About"
            icon={({ color }) => <IconSymbol name="info.circle" size={24} color={color} />}
            active={active === '/about'}
            onPress={() => navigateTo('/about')}
            accessibilityLabel="About"
          />
        </Drawer.Section>

        {/* Bouton de déconnexion pour les utilisateurs authentifiés */}
        {isAuthenticated && (
          <>
            <Divider style={styles.divider} />

            <Drawer.Section>
              <Drawer.Item
                label="Déconnexion"
                icon={({ color }) => <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color={color} />}
                onPress={handleLogout}
                accessibilityLabel="Déconnexion"
              />
            </Drawer.Section>
          </>
        )}
      </ScrollView>

      {/* Pied de page */}
      <ThemedView style={styles.footer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo AgriConnect"
        />
        <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '85%',
    maxWidth: 350,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  hidden: {
    display: 'none',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingTop: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  userType: {
    opacity: 0.7,
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
    marginTop: 16,
  },
  loginText: {
    color: COLORS.primary.main,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 8,
  },
  badge: {
    backgroundColor: COLORS.state.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 40,
    width: 120,
  },
  version: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
});

export default AppMenu;
