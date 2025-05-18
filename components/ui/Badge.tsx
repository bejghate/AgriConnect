import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/constants/Theme';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'crops' | 'livestock' | 'soil' | 'weather' | 'finance';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  outlined = false,
  style,
  textStyle,
}) => {
  // Déterminer les couleurs en fonction de la variante
  const getColors = () => {
    let backgroundColor: string;
    let textColor: string;
    
    switch (variant) {
      case 'primary':
        backgroundColor = COLORS.primary.main;
        textColor = '#fff';
        break;
      case 'secondary':
        backgroundColor = COLORS.secondary.main;
        textColor = '#fff';
        break;
      case 'success':
        backgroundColor = COLORS.state.success;
        textColor = '#fff';
        break;
      case 'error':
        backgroundColor = COLORS.state.error;
        textColor = '#fff';
        break;
      case 'warning':
        backgroundColor = COLORS.state.warning;
        textColor = '#000';
        break;
      case 'info':
        backgroundColor = COLORS.state.info;
        textColor = '#fff';
        break;
      case 'crops':
        backgroundColor = COLORS.categories.crops;
        textColor = '#fff';
        break;
      case 'livestock':
        backgroundColor = COLORS.categories.livestock;
        textColor = '#fff';
        break;
      case 'soil':
        backgroundColor = COLORS.categories.soil;
        textColor = '#fff';
        break;
      case 'weather':
        backgroundColor = COLORS.categories.weather;
        textColor = '#fff';
        break;
      case 'finance':
        backgroundColor = COLORS.categories.finance;
        textColor = '#fff';
        break;
      default:
        backgroundColor = COLORS.primary.main;
        textColor = '#fff';
    }
    
    return { backgroundColor, textColor };
  };
  
  const { backgroundColor, textColor } = getColors();
  
  // Styles pour les badges outlined
  const outlinedStyle: ViewStyle = outlined
    ? {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: backgroundColor,
      }
    : {};
  
  const outlinedTextStyle: TextStyle = outlined
    ? {
        color: backgroundColor,
      }
    : {};
  
  // Styles pour les différentes tailles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          containerStyle: styles.smallContainer,
          textStyle: styles.smallText,
        };
      case 'medium':
        return {
          containerStyle: styles.mediumContainer,
          textStyle: styles.mediumText,
        };
      case 'large':
        return {
          containerStyle: styles.largeContainer,
          textStyle: styles.largeText,
        };
      default:
        return {
          containerStyle: styles.mediumContainer,
          textStyle: styles.mediumText,
        };
    }
  };
  
  const { containerStyle, textStyle: sizeTextStyle } = getSizeStyle();
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        containerStyle,
        outlinedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          sizeTextStyle,
          outlinedTextStyle,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  
  // Tailles
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mediumContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  largeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});

export default Badge;
