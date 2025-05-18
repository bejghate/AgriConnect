import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { DataSavingModal, useDataSaving } from './DataSavingMode';
import { COLORS } from '@/constants/Theme';

interface DataSavingButtonProps {
  size?: number;
  style?: any;
  showText?: boolean;
  accessibilityLabel?: string;
}

/**
 * Button component to toggle data saving mode
 */
export const DataSavingButton: React.FC<DataSavingButtonProps> = ({
  size = 24,
  style,
  showText = false,
  accessibilityLabel = 'Data saving mode',
}) => {
  const theme = useTheme();
  const { isEnabled } = useDataSaving();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Open modal
  const openModal = () => {
    setIsModalVisible(true);
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  return (
    <View>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={openModal}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityHint="Opens data saving mode settings"
      >
        <IconSymbol
          name="speedometer"
          size={size}
          color={isEnabled ? COLORS.primary.main : theme.colors.onSurfaceVariant}
        />
        
        {showText && (
          <ThemedText
            style={[
              styles.buttonText,
              isEnabled && { color: COLORS.primary.main },
            ]}
          >
            {isEnabled ? 'Data Saving On' : 'Data Saving Off'}
          </ThemedText>
        )}
      </TouchableOpacity>
      
      <DataSavingModal
        isVisible={isModalVisible}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
  },
});

export default DataSavingButton;
