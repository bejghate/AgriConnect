import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface LoadingPlaceholderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  text?: string;
  type?: 'rectangle' | 'circle' | 'text' | 'card';
  animated?: boolean;
  delay?: number;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  text,
  type = 'rectangle',
  animated = true,
  delay = 0,
}) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  
  // Définir les dimensions et le borderRadius en fonction du type
  let placeholderStyle: ViewStyle = { width, height, borderRadius };
  
  if (type === 'circle') {
    const size = typeof width === 'number' ? width : 40;
    placeholderStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  } else if (type === 'card') {
    placeholderStyle = {
      width,
      height,
      borderRadius: 8,
      padding: 16,
    };
  }
  
  // Animation de pulsation
  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      
      animation.start();
      
      return () => {
        animation.stop();
      };
    }
  }, [animated, opacity, delay]);
  
  // Rendu du placeholder
  return (
    <ThemedView style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.placeholder,
          placeholderStyle,
          {
            backgroundColor: theme.dark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
            opacity,
          },
        ]}
        accessibilityLabel={text || "Chargement en cours"}
        accessibilityRole="progressbar"
      />
      
      {text && (
        <ThemedText style={styles.text}>
          {text}
        </ThemedText>
      )}
    </ThemedView>
  );
};

// Composant pour afficher plusieurs placeholders
interface LoadingPlaceholdersProps {
  count: number;
  type?: 'rectangle' | 'circle' | 'text' | 'card';
  width?: number | string;
  height?: number | string;
  spacing?: number;
  style?: ViewStyle;
}

export const LoadingPlaceholders: React.FC<LoadingPlaceholdersProps> = ({
  count,
  type = 'rectangle',
  width = '100%',
  height = 20,
  spacing = 8,
  style,
}) => {
  return (
    <ThemedView style={[styles.placeholdersContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingPlaceholder
          key={index}
          type={type}
          width={width}
          height={height}
          style={{ marginBottom: index < count - 1 ? spacing : 0 }}
          delay={index * 100} // Décalage des animations
        />
      ))}
    </ThemedView>
  );
};

// Composant pour afficher un placeholder de carte
export const CardPlaceholder: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <ThemedView style={[styles.cardContainer, style]}>
      <LoadingPlaceholder
        type="rectangle"
        height={150}
        borderRadius={8}
        style={styles.cardImage}
      />
      <ThemedView style={styles.cardContent}>
        <LoadingPlaceholder
          type="text"
          width="70%"
          height={20}
          style={styles.cardTitle}
        />
        <LoadingPlaceholder
          type="text"
          width="90%"
          height={16}
          style={styles.cardSubtitle}
        />
        <LoadingPlaceholder
          type="text"
          width="60%"
          height={16}
          style={styles.cardSubtitle}
        />
      </ThemedView>
    </ThemedView>
  );
};

// Composant pour afficher un placeholder de liste
export const ListItemPlaceholder: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <ThemedView style={[styles.listItemContainer, style]}>
      <LoadingPlaceholder
        type="circle"
        width={40}
        style={styles.listItemAvatar}
      />
      <ThemedView style={styles.listItemContent}>
        <LoadingPlaceholder
          type="text"
          width="60%"
          height={16}
          style={styles.listItemTitle}
        />
        <LoadingPlaceholder
          type="text"
          width="80%"
          height={14}
          style={styles.listItemSubtitle}
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  placeholder: {
    overflow: 'hidden',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  placeholdersContainer: {
    width: '100%',
  },
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 4,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  listItemAvatar: {
    marginRight: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    marginBottom: 4,
  },
  listItemSubtitle: {
    marginBottom: 0,
  },
});

export default LoadingPlaceholder;
