import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import GlobalSearch from './GlobalSearch';

interface GlobalSearchButtonProps {
  size?: number;
  color?: string;
  style?: any;
  accessibilityLabel?: string;
}

/**
 * Button component to open the global search
 */
export const GlobalSearchButton: React.FC<GlobalSearchButtonProps> = ({
  size = 24,
  color,
  style,
  accessibilityLabel = 'Global search',
}) => {
  const theme = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Open search
  const openSearch = () => {
    setIsSearchVisible(true);
  };
  
  // Close search
  const closeSearch = () => {
    setIsSearchVisible(false);
  };
  
  return (
    <View>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={openSearch}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint="Opens global search to search across all content"
      >
        <IconSymbol
          name="magnifyingglass"
          size={size}
          color={color || theme.colors.onSurface}
        />
      </TouchableOpacity>
      
      <GlobalSearch
        isVisible={isSearchVisible}
        onClose={closeSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default GlobalSearchButton;
