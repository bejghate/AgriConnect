import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ImageSourcePropType,
  ViewStyle,
  TextStyle
} from 'react-native';
import { COLORS } from '@/constants/Theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  image?: ImageSourcePropType;
  onPress?: () => void;
  showDivider?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  image,
  onPress,
  showDivider = true,
  style,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        showDivider && styles.divider,
        style
      ]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {leftIcon && (
        <View style={styles.leftIconContainer}>
          {leftIcon}
        </View>
      )}
      
      {image && (
        <Image 
          source={image} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        
        {description && (
          <Text style={[styles.description, descriptionStyle]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
      
      {rightIcon && (
        <View style={styles.rightIconContainer}>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.paper,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  leftIconContainer: {
    marginRight: 16,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  rightIconContainer: {
    marginLeft: 16,
  },
});

export default ListItem;
