import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Appbar, Badge, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GlobalSearchButton } from '@/components/search/GlobalSearchButton';
import { NavigationHistoryButton } from '@/components/navigation/NavigationHistoryButton';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { useNotifications } from '@/context/NotificationsContext';
import { useAppStore } from '@/store/useAppStore';
import { COLORS } from '@/constants/Theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  showHistory?: boolean;
  showLanguageSelector?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  transparent?: boolean;
  rightActions?: React.ReactNode;
  accessibilityLabel?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  showNotifications = true,
  showSearch = false,
  showHistory = false,
  showLanguageSelector = false,
  onMenuPress,
  onSearchPress,
  transparent = false,
  rightActions,
  accessibilityLabel,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const { isOnline } = useAppStore();

  // Gérer le retour en arrière
  const handleBack = () => {
    router.back();
  };

  // Gérer l'appui sur l'icône de notifications
  const handleNotificationsPress = () => {
    router.push('/notifications');
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: transparent ? 'transparent' : theme.colors.surface,
        },
      ]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || `En-tête: ${title}`}
    >
      {/* Barre d'état hors ligne */}
      {!isOnline && (
        <ThemedView style={styles.offlineBar}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineText}>
            Vous êtes hors ligne
          </ThemedText>
        </ThemedView>
      )}

      <View style={styles.headerContent}>
        {/* Bouton de menu ou retour */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Retour"
              accessibilityHint="Retourne à l'écran précédent"
            >
              <IconSymbol
                name={Platform.OS === 'ios' ? 'chevron.left' : 'arrow.left'}
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Menu"
              accessibilityHint="Ouvre le menu principal"
            >
              <IconSymbol name="line.3.horizontal" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>

        {/* Titre et sous-titre */}
        <View style={styles.titleContainer}>
          <ThemedText
            type="subtitle"
            style={styles.title}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </ThemedText>

          {subtitle && (
            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </ThemedText>
          )}
        </View>

        {/* Actions à droite */}
        <View style={styles.rightSection}>
          {showSearch && (
            <GlobalSearchButton
              style={styles.iconButton}
              size={24}
              color={theme.colors.onSurface}
              accessibilityLabel="Recherche globale"
            />
          )}

          {showHistory && (
            <NavigationHistoryButton
              style={styles.iconButton}
              size={24}
              color={theme.colors.onSurface}
              accessibilityLabel="Historique de navigation"
            />
          )}

          {showLanguageSelector && (
            <View style={styles.iconButton}>
              <LanguageSelector compact={true} showLabel={false} />
            </View>
          )}

          {showNotifications && (
            <TouchableOpacity
              onPress={handleNotificationsPress}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
              accessibilityHint="Ouvre les notifications"
            >
              <IconSymbol name="bell" size={24} color={theme.colors.onSurface} />
              {unreadCount > 0 && (
                <Badge
                  size={18}
                  style={[styles.badge, { backgroundColor: COLORS.state.error }]}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </TouchableOpacity>
          )}

          {rightActions}
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  offlineBar: {
    backgroundColor: COLORS.state.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  offlineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  iconPlaceholder: {
    width: 40,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default AppHeader;
