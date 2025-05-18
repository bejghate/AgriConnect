import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Maximum number of history items to keep
const MAX_HISTORY_ITEMS = 20;

// Storage key for navigation history
const NAVIGATION_HISTORY_KEY = 'navigation_history';

// Navigation history item interface
export interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: number;
  params?: Record<string, string>;
}

// Navigation history context interface
interface NavigationHistoryContextType {
  history: NavigationHistoryItem[];
  addToHistory: (item: Omit<NavigationHistoryItem, 'timestamp'>) => void;
  clearHistory: () => void;
  goBack: () => void;
  canGoBack: boolean;
  currentPath: string | null;
}

// Create the context
const NavigationHistoryContext = createContext<NavigationHistoryContextType>({
  history: [],
  addToHistory: () => {},
  clearHistory: () => {},
  goBack: () => {},
  canGoBack: false,
  currentPath: null,
});

// Props for the NavigationHistoryProvider
interface NavigationHistoryProviderProps {
  children: ReactNode;
}

/**
 * Provider component for navigation history
 */
export const NavigationHistoryProvider: React.FC<NavigationHistoryProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load history from storage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(NAVIGATION_HISTORY_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading navigation history:', error);
        setIsInitialized(true);
      }
    };
    
    loadHistory();
  }, []);
  
  // Save history to storage when it changes
  useEffect(() => {
    if (isInitialized) {
      const saveHistory = async () => {
        try {
          await AsyncStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
          console.error('Error saving navigation history:', error);
        }
      };
      
      saveHistory();
    }
  }, [history, isInitialized]);
  
  // Track navigation changes
  useEffect(() => {
    if (isInitialized && pathname) {
      // Skip adding to history if it's the same as the current path
      if (history.length > 0 && history[0].path === pathname) {
        return;
      }
      
      // Add current path to history
      const newHistoryItem: NavigationHistoryItem = {
        path: pathname,
        title: getPageTitle(pathname),
        timestamp: Date.now(),
      };
      
      setHistory(prevHistory => {
        // Remove duplicates of the same path
        const filteredHistory = prevHistory.filter(item => item.path !== pathname);
        
        // Add new item to the beginning
        const newHistory = [newHistoryItem, ...filteredHistory];
        
        // Limit history size
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
      });
    }
  }, [pathname, isInitialized]);
  
  // Get page title from path
  const getPageTitle = (path: string): string => {
    // Extract the last part of the path
    const parts = path.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || 'Home';
    
    // Convert to title case and replace hyphens with spaces
    return lastPart
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Add item to history
  const addToHistory = (item: Omit<NavigationHistoryItem, 'timestamp'>) => {
    const newHistoryItem: NavigationHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };
    
    setHistory(prevHistory => {
      // Remove duplicates of the same path
      const filteredHistory = prevHistory.filter(historyItem => historyItem.path !== item.path);
      
      // Add new item to the beginning
      const newHistory = [newHistoryItem, ...filteredHistory];
      
      // Limit history size
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  };
  
  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };
  
  // Go back to previous page
  const goBack = () => {
    if (history.length > 1) {
      // Get the previous page
      const previousPage = history[1];
      
      // Navigate to the previous page
      router.push(previousPage.path);
      
      // Remove the current page from history
      setHistory(prevHistory => prevHistory.slice(1));
    } else {
      // If there's no previous page, go to home
      router.push('/');
    }
  };
  
  // Check if we can go back
  const canGoBack = history.length > 1;
  
  // Get current path
  const currentPath = history.length > 0 ? history[0].path : null;
  
  return (
    <NavigationHistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        goBack,
        canGoBack,
        currentPath,
      }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  );
};

/**
 * Hook to use navigation history
 */
export const useNavigationHistory = () => useContext(NavigationHistoryContext);

export default NavigationHistoryProvider;
