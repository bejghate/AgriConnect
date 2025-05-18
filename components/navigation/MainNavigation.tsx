import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Animated, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/useAppStore';
import { COLORS } from '@/constants/Theme';

// Types de navigation
export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  requiresAuth?: boolean;
  roles?: string[];
};

interface MainNavigationProps {
  items: NavigationItem[];
  position?: 'bottom' | 'side';
  showLabels?: boolean;
  animated?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  items,
  position = 'bottom',
  showLabels = true,
  animated = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { isTablet, screenSize } = useResponsive();
  const { isAuthenticated, user } = useAppStore();
  
  // État pour l'animation
  const [translateY] = useState(new Animated.Value(100));
  const [opacity] = useState(new Animated.Value(0));
  
  // Filtrer les éléments de navigation en fonction de l'authentification et des rôles
  const filteredItems = items.filter(item => {
    // Si l'élément nécessite une authentification et que l'utilisateur n'est pas connecté
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    
    // Si l'élément a des rôles spécifiques et que l'utilisateur n'a pas ces rôles
    if (item.roles && item.roles.length > 0 && user) {
      const hasRequiredRole = item.roles.some(role => 
        user.userTypes.includes(role) || user.primaryUserType === role
      );
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    return true;
  });
  
  // Animer l'apparition de la navigation
  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);
  
  // Déterminer si un élément est actif
  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(route);
  };
  
  // Rendu pour la navigation en bas
  const renderBottomNavigation = () => {
    return (
      <Animated.View
        style={[
          styles.bottomNavContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
            transform: [{ translateY: animated ? translateY : 0 }],
            opacity: animated ? opacity : 1,
          },
        ]}
        accessibilityRole="tablist"
      >
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive(item.route) }}
          >
            <View style={styles.iconContainer}>
              <IconSymbol
                name={item.icon}
                size={24}
                color={isActive(item.route) ? COLORS.primary.main : theme.colors.onSurfaceVariant}
              />
              
              {item.badge && item.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: COLORS.state.error }]}>
                  <ThemedText style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {showLabels && (
              <ThemedText
                style={[
                  styles.navLabel,
                  {
                    color: isActive(item.route) ? COLORS.primary.main : theme.colors.onSurfaceVariant,
                    fontWeight: isActive(item.route) ? '600' : 'normal',
                  },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };
  
  // Rendu pour la navigation latérale (tablettes)
  const renderSideNavigation = () => {
    return (
      <Animated.View
        style={[
          styles.sideNavContainer,
          {
            backgroundColor: theme.colors.surface,
            borderRightColor: theme.colors.outline,
            opacity: animated ? opacity : 1,
          },
        ]}
        accessibilityRole="tablist"
      >
        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.sideNavItem,
              isActive(item.route) && {
                backgroundColor: `${COLORS.primary.main}20`,
                borderLeftColor: COLORS.primary.main,
                borderLeftWidth: 4,
              },
            ]}
            onPress={() => router.push(item.route)}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive(item.route) }}
          >
            <View style={styles.sideIconContainer}>
              <IconSymbol
                name={item.icon}
                size={24}
                color={isActive(item.route) ? COLORS.primary.main : theme.colors.onSurfaceVariant}
              />
              
              {item.badge && item.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: COLORS.state.error }]}>
                  <ThemedText style={styles.badgeText}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </ThemedText>
                </View>
              )}
            </View>
            
            <ThemedText
              style={[
                styles.sideNavLabel,
                {
                  color: isActive(item.route) ? COLORS.primary.main : theme.colors.onSurfaceVariant,
                  fontWeight: isActive(item.route) ? '600' : 'normal',
                },
              ]}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };
  
  // Rendu conditionnel en fonction de la position et du type d'appareil
  if (position === 'side' || (isTablet && position !== 'bottom')) {
    return renderSideNavigation();
  }
  
  return renderBottomNavigation();
};

const styles = StyleSheet.create({
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    width: '100%',
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sideNavContainer: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: 20,
  },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sideIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  sideNavLabel: {
    fontSize: 16,
  },
});

export default MainNavigation;
