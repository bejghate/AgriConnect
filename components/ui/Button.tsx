import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { COLORS } from '@/constants/Theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  // Déterminer les styles en fonction des props
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = { ...styles.button };
    
    // Variante
    switch (variant) {
      case 'primary':
        buttonStyle = { ...buttonStyle, ...styles.primaryButton };
        break;
      case 'secondary':
        buttonStyle = { ...buttonStyle, ...styles.secondaryButton };
        break;
      case 'outline':
        buttonStyle = { ...buttonStyle, ...styles.outlineButton };
        break;
      case 'text':
        buttonStyle = { ...buttonStyle, ...styles.textButton };
        break;
    }
    
    // Taille
    switch (size) {
      case 'small':
        buttonStyle = { ...buttonStyle, ...styles.smallButton };
        break;
      case 'medium':
        buttonStyle = { ...buttonStyle, ...styles.mediumButton };
        break;
      case 'large':
        buttonStyle = { ...buttonStyle, ...styles.largeButton };
        break;
    }
    
    // Largeur
    if (fullWidth) {
      buttonStyle = { ...buttonStyle, ...styles.fullWidth };
    }
    
    // Désactivé
    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.disabledButton };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleObj: TextStyle = { ...styles.buttonText };
    
    // Variante
    switch (variant) {
      case 'primary':
        textStyleObj = { ...textStyleObj, ...styles.primaryButtonText };
        break;
      case 'secondary':
        textStyleObj = { ...textStyleObj, ...styles.secondaryButtonText };
        break;
      case 'outline':
        textStyleObj = { ...textStyleObj, ...styles.outlineButtonText };
        break;
      case 'text':
        textStyleObj = { ...textStyleObj, ...styles.textButtonText };
        break;
    }
    
    // Taille
    switch (size) {
      case 'small':
        textStyleObj = { ...textStyleObj, ...styles.smallButtonText };
        break;
      case 'medium':
        textStyleObj = { ...textStyleObj, ...styles.mediumButtonText };
        break;
      case 'large':
        textStyleObj = { ...textStyleObj, ...styles.largeButtonText };
        break;
    }
    
    // Désactivé
    if (disabled) {
      textStyleObj = { ...textStyleObj, ...styles.disabledButtonText };
    }
    
    return textStyleObj;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : COLORS.primary.main} 
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  
  // Variantes
  primaryButton: {
    backgroundColor: COLORS.primary.main,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary.main,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary.main,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  
  // Tailles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  
  // Largeur
  fullWidth: {
    width: '100%',
  },
  
  // État désactivé
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  
  // Texte
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  outlineButtonText: {
    color: COLORS.primary.main,
  },
  textButtonText: {
    color: COLORS.primary.main,
  },
  disabledButtonText: {
    color: '#757575',
  },
  
  // Tailles de texte
  smallButtonText: {
    fontSize: 14,
  },
  mediumButtonText: {
    fontSize: 16,
  },
  largeButtonText: {
    fontSize: 18,
  },
});

export default Button;
