import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle,
  Image,
  ImageSourcePropType
} from 'react-native';
import { COLORS } from '@/constants/Theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  content?: string;
  image?: ImageSourcePropType;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: TextStyle;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  content,
  image,
  icon,
  footer,
  onPress,
  variant = 'default',
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  children,
}) => {
  // Déterminer les styles en fonction des props
  const getCardStyle = () => {
    let cardStyle: ViewStyle = { ...styles.card };
    
    switch (variant) {
      case 'default':
        cardStyle = { ...cardStyle, ...styles.defaultCard };
        break;
      case 'elevated':
        cardStyle = { ...cardStyle, ...styles.elevatedCard };
        break;
      case 'outlined':
        cardStyle = { ...cardStyle, ...styles.outlinedCard };
        break;
      case 'filled':
        cardStyle = { ...cardStyle, ...styles.filledCard };
        break;
    }
    
    return cardStyle;
  };
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[getCardStyle(), style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {image && (
        <Image 
          source={image} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
      
      <View style={styles.cardContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        {title && (
          <Text style={[styles.title, titleStyle]}>
            {title}
          </Text>
        )}
        
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]}>
            {subtitle}
          </Text>
        )}
        
        {content && (
          <Text style={[styles.content, contentStyle]}>
            {content}
          </Text>
        )}
        
        {children}
      </View>
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  defaultCard: {
    backgroundColor: COLORS.background.paper,
  },
  elevatedCard: {
    backgroundColor: COLORS.background.paper,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlinedCard: {
    backgroundColor: COLORS.background.paper,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filledCard: {
    backgroundColor: COLORS.primary.light + '20', // 20% opacity
  },
  image: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 12,
  },
});

export default Card;
