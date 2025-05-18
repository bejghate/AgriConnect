import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/Theme';

// Types de boutons
export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'gradient' | 'icon';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonShape = 'rounded' | 'pill' | 'square' | 'leaf';
export type ButtonColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface NatureButtonProps {
  label?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  color?: ButtonColor;
  gradientColors?: string[];
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Composant de bouton inspiré de la nature
 */
export const NatureButton: React.FC<NatureButtonProps> = ({
  label,
  icon,
  iconPosition = 'left',
  variant = 'filled',
  size = 'medium',
  shape = 'rounded',
  color = 'primary',
  gradientColors,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  labelStyle,
  iconStyle,
  accessibilityLabel,
  testID,
}) => {
  const theme = useTheme();
  const { triggerHaptic } = useAccessibility();
  
  // Obtenir la couleur du bouton en fonction du type
  const getButtonColor = (): string => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.tertiary;
      case 'success':
        return COLORS.state.success;
      case 'warning':
        return COLORS.state.warning;
      case 'error':
        return COLORS.state.error;
      case 'neutral':
        return theme.colors.surfaceVariant;
      default:
        return theme.colors.primary;
    }
  };
  
  // Obtenir la couleur du texte en fonction de la variante
  const getTextColor = (): string => {
    if (disabled) {
      return theme.colors.onSurfaceVariant;
    }
    
    switch (variant) {
      case 'filled':
        return color === 'neutral' ? theme.colors.onSurface : 'white';
      case 'outlined':
      case 'text':
        return getButtonColor();
      case 'gradient':
        return 'white';
      case 'icon':
        return getButtonColor();
      default:
        return 'white';
    }
  };
  
  // Obtenir les dimensions du bouton en fonction de la taille
  const getButtonDimensions = (): { height: number; paddingHorizontal: number; iconSize: number } => {
    switch (size) {
      case 'small':
        return { height: 32, paddingHorizontal: 12, iconSize: 16 };
      case 'medium':
        return { height: 44, paddingHorizontal: 16, iconSize: 20 };
      case 'large':
        return { height: 56, paddingHorizontal: 24, iconSize: 24 };
      default:
        return { height: 44, paddingHorizontal: 16, iconSize: 20 };
    }
  };
  
  // Obtenir le style du bouton en fonction de la forme
  const getShapeStyle = (): StyleProp<ViewStyle> => {
    const { height } = getButtonDimensions();
    
    switch (shape) {
      case 'pill':
        return { borderRadius: height / 2 };
      case 'square':
        return { borderRadius: 0 };
      case 'leaf':
        return {
          borderRadius: 8,
          borderTopRightRadius: height / 2,
        };
      case 'rounded':
      default:
        return { borderRadius: 8 };
    }
  };
  
  // Obtenir le style du bouton en fonction de la variante
  const getVariantStyle = (): StyleProp<ViewStyle> => {
    const buttonColor = getButtonColor();
    
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: buttonColor,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'icon':
        const { height } = getButtonDimensions();
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          width: height,
          paddingHorizontal: 0,
          justifyContent: 'center',
          alignItems: 'center',
        };
      case 'filled':
      default:
        return {
          backgroundColor: buttonColor,
          borderWidth: 0,
        };
    }
  };
  
  // Obtenir les couleurs du dégradé
  const getGradientColors = (): string[] => {
    if (gradientColors && gradientColors.length >= 2) {
      return gradientColors;
    }
    
    switch (color) {
      case 'primary':
        return COLORS.gradients.primary;
      case 'secondary':
        return COLORS.gradients.secondary;
      case 'accent':
        return COLORS.gradients.accent;
      case 'success':
        return COLORS.gradients.success;
      case 'warning':
        return COLORS.gradients.warning;
      case 'error':
        return COLORS.gradients.error;
      default:
        return COLORS.gradients.primary;
    }
  };
  
  // Dimensions du bouton
  const { height, paddingHorizontal, iconSize } = getButtonDimensions();
  
  // Gérer l'appui sur le bouton
  const handlePress = () => {
    if (onPress && !disabled && !loading) {
      triggerHaptic('light');
      onPress();
    }
  };
  
  // Rendu du contenu du bouton
  const renderButtonContent = () => (
    <>
      {/* Dégradé pour la variante gradient */}
      {variant === 'gradient' && (
        <LinearGradient
          colors={getGradientColors()}
          style={[styles.gradient, getShapeStyle()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Indicateur de chargement */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <View style={styles.contentContainer}>
          {/* Icône à gauche */}
          {icon && iconPosition === 'left' && (
            <IconSymbol
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={[styles.icon, styles.leftIcon, iconStyle]}
            />
          )}
          
          {/* Texte du bouton */}
          {label && variant !== 'icon' && (
            <ThemedText
              style={[
                styles.label,
                { color: getTextColor(), fontSize: size === 'small' ? 14 : 16 },
                labelStyle,
              ]}
            >
              {label}
            </ThemedText>
          )}
          
          {/* Icône à droite ou icône centrale pour la variante icon */}
          {icon && (iconPosition === 'right' || variant === 'icon') && (
            <IconSymbol
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={[
                styles.icon,
                iconPosition === 'right' ? styles.rightIcon : styles.centerIcon,
                iconStyle,
              ]}
            />
          )}
        </View>
      )}
    </>
  );
  
  // Rendu du bouton
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getShapeStyle(),
        { height, paddingHorizontal },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: loading }}
      testID={testID}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
        outlineStyle: 'none',
      },
    }),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  centerIcon: {
    margin: 0,
  },
  loader: {
    alignSelf: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NatureButton;
