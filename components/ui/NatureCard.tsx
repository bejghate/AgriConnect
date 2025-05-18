import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useResponsive } from '@/hooks/useResponsive';
import { COLORS } from '@/constants/Theme';

// Types de cartes
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient';
export type CardSize = 'small' | 'medium' | 'large' | 'full';
export type CardShape = 'square' | 'rounded' | 'leaf';

interface NatureCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: any; // Source d'image (URI ou ressource locale)
  icon?: string; // Nom de l'icône
  iconColor?: string; // Couleur de l'icône
  variant?: CardVariant; // Variante de la carte
  size?: CardSize; // Taille de la carte
  shape?: CardShape; // Forme de la carte
  gradientColors?: string[]; // Couleurs du dégradé (pour la variante gradient)
  onPress?: () => void; // Fonction appelée lors du clic sur la carte
  disabled?: boolean; // Désactiver la carte
  style?: StyleProp<ViewStyle>; // Style personnalisé
  titleStyle?: StyleProp<TextStyle>; // Style du titre
  subtitleStyle?: StyleProp<TextStyle>; // Style du sous-titre
  descriptionStyle?: StyleProp<TextStyle>; // Style de la description
  children?: React.ReactNode; // Contenu personnalisé
  accessibilityLabel?: string; // Label d'accessibilité
  testID?: string; // ID de test
}

/**
 * Composant de carte inspiré de la nature pour afficher du contenu
 */
export const NatureCard: React.FC<NatureCardProps> = ({
  title,
  subtitle,
  description,
  image,
  icon,
  iconColor,
  variant = 'default',
  size = 'medium',
  shape = 'rounded',
  gradientColors,
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  children,
  accessibilityLabel,
  testID,
}) => {
  const theme = useTheme();
  const { isTablet, screenWidth } = useResponsive();
  
  // Déterminer les dimensions de la carte en fonction de la taille
  const getCardDimensions = (): { width: number | string; height: number } => {
    const screenSize = Dimensions.get('window');
    const baseWidth = screenSize.width;
    const padding = 16;
    
    switch (size) {
      case 'small':
        return {
          width: isTablet ? baseWidth / 4 - padding * 2 : baseWidth / 2 - padding * 2,
          height: 120,
        };
      case 'medium':
        return {
          width: isTablet ? baseWidth / 3 - padding * 2 : baseWidth - padding * 2,
          height: 180,
        };
      case 'large':
        return {
          width: isTablet ? baseWidth / 2 - padding * 2 : baseWidth - padding * 2,
          height: 240,
        };
      case 'full':
        return {
          width: baseWidth - padding * 2,
          height: 280,
        };
      default:
        return {
          width: baseWidth - padding * 2,
          height: 180,
        };
    }
  };
  
  // Obtenir les dimensions de la carte
  const { width, height } = getCardDimensions();
  
  // Déterminer le style de la carte en fonction de la variante
  const getCardStyle = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
            web: {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            },
          }),
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surfaceVariant,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
        };
    }
  };
  
  // Déterminer le style de la forme de la carte
  const getShapeStyle = (): StyleProp<ViewStyle> => {
    switch (shape) {
      case 'square':
        return {
          borderRadius: 0,
        };
      case 'leaf':
        return {
          borderRadius: 16,
          borderTopRightRadius: 40,
        };
      case 'rounded':
      default:
        return {
          borderRadius: 16,
        };
    }
  };
  
  // Déterminer les couleurs du dégradé
  const getGradientColors = (): string[] => {
    if (gradientColors && gradientColors.length >= 2) {
      return gradientColors;
    }
    return COLORS.gradients.primary;
  };
  
  // Rendu du contenu de la carte
  const renderCardContent = () => (
    <>
      {/* Image de fond */}
      {image && (
        <View style={styles.imageContainer}>
          <OptimizedImage
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </View>
      )}
      
      {/* Dégradé pour la variante gradient */}
      {variant === 'gradient' && (
        <LinearGradient
          colors={getGradientColors()}
          style={[styles.gradient, getShapeStyle()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Contenu */}
      <View style={styles.content}>
        {/* Icône */}
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol
              name={icon}
              size={24}
              color={iconColor || theme.colors.primary}
            />
          </View>
        )}
        
        {/* Texte */}
        <View style={styles.textContainer}>
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.title,
              image && styles.titleOnImage,
              variant === 'gradient' && styles.titleOnGradient,
              titleStyle,
            ]}
            numberOfLines={2}
          >
            {title}
          </ThemedText>
          
          {subtitle && (
            <ThemedText
              style={[
                styles.subtitle,
                image && styles.subtitleOnImage,
                variant === 'gradient' && styles.subtitleOnGradient,
                subtitleStyle,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </ThemedText>
          )}
          
          {description && (
            <ThemedText
              style={[
                styles.description,
                image && styles.descriptionOnImage,
                variant === 'gradient' && styles.descriptionOnGradient,
                descriptionStyle,
              ]}
              numberOfLines={3}
            >
              {description}
            </ThemedText>
          )}
        </View>
        
        {/* Contenu personnalisé */}
        {children}
      </View>
    </>
  );
  
  // Rendu de la carte
  return (
    <TouchableOpacity
      style={[
        styles.container,
        getCardStyle(),
        getShapeStyle(),
        { width, height },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {renderCardContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    margin: 8,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  iconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  titleOnImage: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleOnImage: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionOnImage: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleOnGradient: {
    color: 'white',
  },
  subtitleOnGradient: {
    color: 'white',
  },
  descriptionOnGradient: {
    color: 'white',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NatureCard;
