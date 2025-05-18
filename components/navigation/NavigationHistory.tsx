import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigationHistory, NavigationHistoryItem } from '@/context/NavigationHistoryContext';

interface NavigationHistoryProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Component to display navigation history
 */
export const NavigationHistory: React.FC<NavigationHistoryProps> = ({
  isVisible,
  onClose,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { history, clearHistory } = useNavigationHistory();
  
  // Animation values
  const [slideAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));
  
  // Show animation
  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);
  
  // Navigate to history item
  const navigateToHistoryItem = (item: NavigationHistoryItem) => {
    router.push(item.path);
    onClose();
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const now = new Date();
    const date = new Date(timestamp);
    
    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, show date
    return date.toLocaleDateString();
  };
  
  // Handle clear history
  const handleClearHistory = () => {
    clearHistory();
    onClose();
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnimation,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View
          style={[
            styles.historyContainer,
            {
              transform: [
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Navigation History</ThemedText>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close navigation history"
              accessibilityRole="button"
            >
              <IconSymbol name="xmark" size={20} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </ThemedView>
          
          <ScrollView style={styles.historyList}>
            {history.length > 0 ? (
              history.map((item, index) => (
                <TouchableOpacity
                  key={`${item.path}-${index}`}
                  style={[
                    styles.historyItem,
                    index === 0 && styles.currentHistoryItem,
                  ]}
                  onPress={() => navigateToHistoryItem(item)}
                  accessibilityLabel={`Navigate to ${item.title}`}
                  accessibilityRole="button"
                >
                  <ThemedView style={styles.historyItemContent}>
                    <IconSymbol
                      name={index === 0 ? 'location.fill' : 'clock.arrow.circlepath'}
                      size={20}
                      color={index === 0 ? theme.colors.primary : theme.colors.onSurfaceVariant}
                      style={styles.historyItemIcon}
                    />
                    
                    <ThemedView style={styles.historyItemTextContent}>
                      <ThemedText
                        type={index === 0 ? 'defaultSemiBold' : 'default'}
                        style={styles.historyItemTitle}
                      >
                        {item.title}
                      </ThemedText>
                      
                      <ThemedText style={styles.historyItemPath}>
                        {item.path}
                      </ThemedText>
                    </ThemedView>
                    
                    <ThemedText style={styles.historyItemTime}>
                      {formatTimestamp(item.timestamp)}
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              ))
            ) : (
              <ThemedView style={styles.emptyHistory}>
                <IconSymbol
                  name="clock"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                />
                <ThemedText style={styles.emptyHistoryText}>
                  No navigation history yet
                </ThemedText>
              </ThemedView>
            )}
          </ScrollView>
          
          {history.length > 0 && (
            <ThemedView style={styles.footer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearHistory}
                accessibilityLabel="Clear navigation history"
                accessibilityRole="button"
              >
                <IconSymbol
                  name="trash"
                  size={16}
                  color={theme.colors.error}
                  style={styles.clearButtonIcon}
                />
                <ThemedText style={[styles.clearButtonText, { color: theme.colors.error }]}>
                  Clear History
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  historyContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  historyList: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentHistoryItem: {
    backgroundColor: '#f5f5f5',
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemIcon: {
    marginRight: 12,
  },
  historyItemTextContent: {
    flex: 1,
  },
  historyItemTitle: {
    marginBottom: 4,
  },
  historyItemPath: {
    fontSize: 12,
    color: '#757575',
  },
  historyItemTime: {
    fontSize: 12,
    color: '#9e9e9e',
    marginLeft: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyHistoryText: {
    marginTop: 16,
    color: '#757575',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  clearButtonIcon: {
    marginRight: 8,
  },
  clearButtonText: {
    fontWeight: '500',
  },
});

export default NavigationHistory;
