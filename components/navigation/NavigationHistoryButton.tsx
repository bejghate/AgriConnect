import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import NavigationHistory from './NavigationHistory';
import { useNavigationHistory } from '@/context/NavigationHistoryContext';

interface NavigationHistoryButtonProps {
  size?: number;
  color?: string;
  style?: any;
  accessibilityLabel?: string;
}

/**
 * Button component to open the navigation history
 */
export const NavigationHistoryButton: React.FC<NavigationHistoryButtonProps> = ({
  size = 24,
  color,
  style,
  accessibilityLabel = 'Navigation history',
}) => {
  const theme = useTheme();
  const { history } = useNavigationHistory();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  
  // Open history
  const openHistory = () => {
    setIsHistoryVisible(true);
  };
  
  // Close history
  const closeHistory = () => {
    setIsHistoryVisible(false);
  };
  
  return (
    <View>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={openHistory}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint="Opens navigation history to see recently visited pages"
        disabled={history.length === 0}
      >
        <IconSymbol
          name="clock.arrow.circlepath"
          size={size}
          color={history.length === 0 ? theme.colors.onSurfaceVariant : (color || theme.colors.onSurface)}
        />
      </TouchableOpacity>
      
      <NavigationHistory
        isVisible={isHistoryVisible}
        onClose={closeHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default NavigationHistoryButton;
