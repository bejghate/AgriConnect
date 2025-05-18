import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  StyleProp,
  ViewStyle,
  TextStyle,
  ListRenderItem,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/Theme';

// Types d'éléments de liste
export type ListItemVariant = 'default' | 'card' | 'compact' | 'detailed' | 'icon';
export type ListItemShape = 'square' | 'rounded' | 'leaf';
export type ListItemSize = 'small' | 'medium' | 'large';

// Interface pour les éléments de liste
export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: any; // Source d'image (URI ou ressource locale)
  icon?: string; // Nom de l'icône
  iconColor?: string; // Couleur de l'icône
  badge?: number | string; // Badge (nombre ou texte)
  badgeColor?: string; // Couleur du badge
  category?: string; // Catégorie (pour le style)
  data?: any; // Données supplémentaires
}

interface NatureListItemProps {
  item: ListItem;
  variant?: ListItemVariant;
  shape?: ListItemShape;
  size?: ListItemSize;
  onPress?: (item: ListItem) => void;
  onLongPress?: (item: ListItem) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  showDivider?: boolean;
  rightComponent?: React.ReactNode;
  testID?: string;
}

/**
 * Composant d'élément de liste inspiré de la nature
 */
export const NatureListItem: React.FC<NatureListItemProps> = ({
  item,
  variant = 'default',
  shape = 'rounded',
  size = 'medium',
  onPress,
  onLongPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  showDivider = true,
  rightComponent,
  testID,
}) => {
  const theme = useTheme();
  const { triggerHaptic } = useAccessibility();
  
  // Obtenir la hauteur de l'élément en fonction de la taille
  const getItemHeight = (): number => {
    switch (size) {
      case 'small':
        return variant === 'compact' ? 48 : 64;
      case 'medium':
        return variant === 'compact' ? 56 : variant === 'detailed' ? 88 : 72;
      case 'large':
        return variant === 'detailed' ? 120 : 80;
      default:
        return 72;
    }
  };
  
  // Obtenir la taille de l'image ou de l'icône en fonction de la taille
  const getImageSize = (): number => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 56;
      case 'large':
        return 72;
      default:
        return 56;
    }
  };
  
  // Obtenir la taille de l'icône en fonction de la taille
  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };
  
  // Obtenir le style de la forme de l'élément
  const getShapeStyle = (): StyleProp<ViewStyle> => {
    switch (shape) {
      case 'square':
        return { borderRadius: 0 };
      case 'leaf':
        return {
          borderRadius: 8,
          borderTopRightRadius: 24,
        };
      case 'rounded':
      default:
        return { borderRadius: 8 };
    }
  };
  
  // Obtenir la couleur de l'icône en fonction de la catégorie
  const getIconColor = (): string => {
    if (item.iconColor) {
      return item.iconColor;
    }
    
    if (item.category) {
      switch (item.category) {
        case 'crops':
          return COLORS.categories.crops;
        case 'livestock':
          return COLORS.categories.livestock;
        case 'soil':
          return COLORS.categories.soil;
        case 'weather':
          return COLORS.categories.weather;
        case 'finance':
          return COLORS.categories.finance;
        default:
          return COLORS.categories.general;
      }
    }
    
    return theme.colors.primary;
  };
  
  // Obtenir la couleur du badge
  const getBadgeColor = (): string => {
    if (item.badgeColor) {
      return item.badgeColor;
    }
    
    return COLORS.state.info;
  };
  
  // Gérer l'appui sur l'élément
  const handlePress = () => {
    if (onPress && !disabled) {
      triggerHaptic('light');
      onPress(item);
    }
  };
  
  // Gérer l'appui long sur l'élément
  const handleLongPress = () => {
    if (onLongPress && !disabled) {
      triggerHaptic('medium');
      onLongPress(item);
    }
  };
  
  // Hauteur et tailles
  const itemHeight = getItemHeight();
  const imageSize = getImageSize();
  const iconSize = getIconSize();
  
  // Rendu de l'élément de liste
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { height: itemHeight },
        variant === 'card' && [styles.card, getShapeStyle()],
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled || (!onPress && !onLongPress)}
      activeOpacity={0.7}
      accessibilityLabel={item.title}
      accessibilityRole="button"
      accessibilityHint={item.subtitle}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {/* Contenu de l'élément */}
      <View style={styles.content}>
        {/* Image ou icône */}
        {(item.image || item.icon) && (
          <View
            style={[
              styles.imageContainer,
              { width: imageSize, height: imageSize },
              variant === 'icon' && styles.iconContainer,
              variant === 'icon' && { backgroundColor: `${getIconColor()}20` },
            ]}
          >
            {item.image ? (
              <OptimizedImage
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                style={[
                  styles.image,
                  variant !== 'card' && { borderRadius: imageSize / 2 },
                ]}
                resizeMode="cover"
              />
            ) : item.icon ? (
              <IconSymbol
                name={item.icon}
                size={iconSize}
                color={getIconColor()}
              />
            ) : null}
          </View>
        )}
        
        {/* Texte */}
        <View style={styles.textContainer}>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.title,
              { fontSize: size === 'small' ? 14 : 16 },
              titleStyle,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </ThemedText>
          
          {item.subtitle && (
            <ThemedText
              style={[
                styles.subtitle,
                { fontSize: size === 'small' ? 12 : 14 },
                subtitleStyle,
              ]}
              numberOfLines={1}
            >
              {item.subtitle}
            </ThemedText>
          )}
          
          {item.description && variant === 'detailed' && (
            <ThemedText
              style={[
                styles.description,
                { fontSize: size === 'small' ? 12 : 14 },
                descriptionStyle,
              ]}
              numberOfLines={2}
            >
              {item.description}
            </ThemedText>
          )}
        </View>
        
        {/* Composant à droite ou badge */}
        {rightComponent ? (
          rightComponent
        ) : item.badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: getBadgeColor() },
            ]}
          >
            <ThemedText style={styles.badgeText}>
              {item.badge}
            </ThemedText>
          </View>
        ) : null}
      </View>
      
      {/* Séparateur */}
      {showDivider && variant !== 'card' && (
        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
      )}
    </TouchableOpacity>
  );
};

interface NatureListProps<T extends ListItem> {
  data: T[];
  variant?: ListItemVariant;
  shape?: ListItemShape;
  size?: ListItemSize;
  onItemPress?: (item: T) => void;
  onItemLongPress?: (item: T) => void;
  keyExtractor?: (item: T) => string;
  renderItem?: ListRenderItem<T>;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  showDividers?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontal?: boolean;
  numColumns?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  testID?: string;
}

/**
 * Composant de liste inspiré de la nature
 */
export function NatureList<T extends ListItem>({
  data,
  variant = 'default',
  shape = 'rounded',
  size = 'medium',
  onItemPress,
  onItemLongPress,
  keyExtractor = (item) => item.id,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  showDividers = true,
  style,
  contentContainerStyle,
  horizontal = false,
  numColumns = 1,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  testID,
}: NatureListProps<T>) {
  // Rendu par défaut des éléments de liste
  const defaultRenderItem: ListRenderItem<T> = ({ item }) => (
    <NatureListItem
      item={item}
      variant={variant}
      shape={shape}
      size={size}
      onPress={onItemPress ? () => onItemPress(item) : undefined}
      onLongPress={onItemLongPress ? () => onItemLongPress(item) : undefined}
      showDivider={showDividers && !horizontal}
      testID={`${testID}-item-${item.id}`}
    />
  );
  
  return (
    <FlatList
      data={data}
      renderItem={renderItem || defaultRenderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      horizontal={horizontal}
      numColumns={numColumns}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      style={[styles.list, style]}
      contentContainerStyle={[
        styles.listContent,
        horizontal && styles.horizontalListContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={!horizontal}
      showsHorizontalScrollIndicator={horizontal}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  horizontalListContent: {
    paddingHorizontal: 8,
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    margin: 8,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    marginRight: 16,
    overflow: 'hidden',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  description: {
    opacity: 0.6,
    marginTop: 4,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NatureList;
