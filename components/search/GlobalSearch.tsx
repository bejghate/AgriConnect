import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar, Chip, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAccessibilityContext } from '@/context/AccessibilityContext';
import { useOffline } from '@/context/OfflineContext';
import { COLORS } from '@/constants/Theme';

// Storage key for recent searches
const RECENT_SEARCHES_KEY = 'global_recent_searches';

// Search result types
export type SearchResultType = 'encyclopedia' | 'marketplace' | 'forum' | 'farm' | 'weather' | 'financial';

// Search result item interface
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  type: SearchResultType;
  route: string;
  imageUrl?: string;
  tags?: string[];
  matchScore?: number;
}

// Props for the GlobalSearch component
interface GlobalSearchProps {
  isVisible: boolean;
  onClose: () => void;
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Global search component accessible from anywhere in the app
 */
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isVisible,
  onClose,
  initialQuery = '',
  placeholder = 'Search across AgriConnect...',
  autoFocus = true,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { preferences } = useAccessibilityContext();
  const { isOnline } = useOffline();
  const searchInputRef = useRef<RNTextInput>(null);
  
  // Animation values
  const [slideAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SearchResultType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);
  
  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      showSearch();
      if (autoFocus) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 300);
      }
    } else {
      hideSearch();
    }
  }, [isVisible]);
  
  // Load recent searches from storage
  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };
  
  // Save recent searches to storage
  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };
  
  // Show search animation
  const showSearch = () => {
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
  };
  
  // Hide search animation
  const hideSearch = () => {
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
  };
  
  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 2) {
      performSearch(query);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  
  // Perform search across all content
  const performSearch = (query: string) => {
    setIsSearching(true);
    
    // In a real app, this would be an API call to a search endpoint
    // For now, we'll simulate a search with a timeout
    setTimeout(() => {
      // Mock search results
      const results: SearchResultItem[] = [
        {
          id: 'enc-1',
          title: 'Sustainable Farming Practices',
          description: 'Learn about sustainable farming methods that improve soil health and crop yields.',
          type: 'encyclopedia',
          route: '/encyclopedia/detail?id=sustainable-farming',
          tags: ['farming', 'sustainability', 'soil'],
        },
        {
          id: 'mkt-1',
          title: 'Organic Fertilizers',
          description: 'High-quality organic fertilizers for all types of crops.',
          type: 'marketplace',
          route: '/marketplace/product?id=organic-fertilizers',
          tags: ['fertilizer', 'organic', 'crops'],
        },
        {
          id: 'forum-1',
          title: 'Best practices for tomato cultivation',
          description: 'Discussion on the best practices for tomato cultivation in dry regions.',
          type: 'forum',
          route: '/forum/topic?id=tomato-cultivation',
          tags: ['tomato', 'cultivation', 'discussion'],
        },
        {
          id: 'fin-1',
          title: 'Agricultural Equipment Loan',
          description: 'Financing options for purchasing agricultural equipment.',
          type: 'financial',
          route: '/financial-services/product-details?id=equipment-loan',
          tags: ['loan', 'equipment', 'financing'],
        },
      ];
      
      // Filter results if filters are selected
      const filteredResults = selectedFilters.length > 0
        ? results.filter(result => selectedFilters.includes(result.type))
        : results;
      
      setSearchResults(filteredResults);
      setIsSearching(false);
      
      // Add to recent searches if not already there
      if (query.trim() && !recentSearches.includes(query.trim())) {
        const updatedSearches = [query.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        saveRecentSearches(updatedSearches);
      }
    }, 500);
  };
  
  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };
  
  // Handle recent search selection
  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };
  
  // Clear recent searches
  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  };
  
  // Toggle filter selection
  const toggleFilter = (filter: SearchResultType) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  // Navigate to search result
  const navigateToResult = (result: SearchResultItem) => {
    router.push(result.route);
    onClose();
  };
  
  // Get filter color
  const getFilterColor = (filter: SearchResultType) => {
    switch (filter) {
      case 'encyclopedia':
        return COLORS.categories.crops;
      case 'marketplace':
        return COLORS.categories.livestock;
      case 'forum':
        return COLORS.categories.general;
      case 'farm':
        return COLORS.categories.soil;
      case 'weather':
        return COLORS.categories.weather;
      case 'financial':
        return COLORS.categories.finance;
      default:
        return COLORS.primary.main;
    }
  };
  
  // Get filter icon
  const getFilterIcon = (filter: SearchResultType) => {
    switch (filter) {
      case 'encyclopedia':
        return 'book.fill';
      case 'marketplace':
        return 'cart.fill';
      case 'forum':
        return 'bubble.left.and.bubble.right.fill';
      case 'farm':
        return 'leaf.fill';
      case 'weather':
        return 'cloud.sun.fill';
      case 'financial':
        return 'dollarsign.circle.fill';
      default:
        return 'magnifyingglass';
    }
  };
  
  // Get result type label
  const getResultTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'encyclopedia':
        return 'Encyclopedia';
      case 'marketplace':
        return 'Marketplace';
      case 'forum':
        return 'Forum';
      case 'farm':
        return 'Farm Management';
      case 'weather':
        return 'Weather';
      case 'financial':
        return 'Financial Services';
      default:
        return type;
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
          transform: [
            {
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
              }),
            },
          ],
          paddingTop: insets.top,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      
      <ThemedView style={styles.searchContainer}>
        <View style={styles.searchHeader}>
          <Searchbar
            placeholder={placeholder}
            onChangeText={handleSearchChange}
            value={searchQuery}
            onSubmitEditing={handleSearchSubmit}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            ref={searchInputRef}
            icon={() => <IconSymbol name="magnifyingglass" size={20} color={theme.colors.onSurfaceVariant} />}
            clearIcon={() => <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.onSurfaceVariant} />}
            onClearIconPress={clearSearch}
            autoCapitalize="none"
            returnKeyType="search"
            accessibilityLabel="Global search"
            accessibilityHint="Search across all content in the app"
          />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close search"
            accessibilityRole="button"
          >
            <ThemedText>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(!showFilters)}
          accessibilityLabel="Toggle search filters"
          accessibilityRole="button"
        >
          <ThemedText style={styles.filtersButtonText}>
            Filters {selectedFilters.length > 0 ? `(${selectedFilters.length})` : ''}
          </ThemedText>
          <IconSymbol
            name={showFilters ? 'chevron.up' : 'chevron.down'}
            size={16}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        
        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            <Chip
              mode="outlined"
              selected={selectedFilters.includes('encyclopedia')}
              onPress={() => toggleFilter('encyclopedia')}
              style={[
                styles.filterChip,
                selectedFilters.includes('encyclopedia') && {
                  backgroundColor: COLORS.categories.crops + '20',
                },
              ]}
              textStyle={styles.filterChipText}
              icon={() => (
                <IconSymbol
                  name={getFilterIcon('encyclopedia')}
                  size={16}
                  color={COLORS.categories.crops}
                />
              )}
            >
              Encyclopedia
            </Chip>
            
            <Chip
              mode="outlined"
              selected={selectedFilters.includes('marketplace')}
              onPress={() => toggleFilter('marketplace')}
              style={[
                styles.filterChip,
                selectedFilters.includes('marketplace') && {
                  backgroundColor: COLORS.categories.livestock + '20',
                },
              ]}
              textStyle={styles.filterChipText}
              icon={() => (
                <IconSymbol
                  name={getFilterIcon('marketplace')}
                  size={16}
                  color={COLORS.categories.livestock}
                />
              )}
            >
              Marketplace
            </Chip>
            
            <Chip
              mode="outlined"
              selected={selectedFilters.includes('forum')}
              onPress={() => toggleFilter('forum')}
              style={[
                styles.filterChip,
                selectedFilters.includes('forum') && {
                  backgroundColor: COLORS.categories.general + '20',
                },
              ]}
              textStyle={styles.filterChipText}
              icon={() => (
                <IconSymbol
                  name={getFilterIcon('forum')}
                  size={16}
                  color={COLORS.categories.general}
                />
              )}
            >
              Forum
            </Chip>
            
            <Chip
              mode="outlined"
              selected={selectedFilters.includes('financial')}
              onPress={() => toggleFilter('financial')}
              style={[
                styles.filterChip,
                selectedFilters.includes('financial') && {
                  backgroundColor: COLORS.categories.finance + '20',
                },
              ]}
              textStyle={styles.filterChipText}
              icon={() => (
                <IconSymbol
                  name={getFilterIcon('financial')}
                  size={16}
                  color={COLORS.categories.finance}
                />
              )}
            >
              Financial
            </Chip>
          </ScrollView>
        )}
        
        <ScrollView style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <ThemedText style={styles.loadingText}>Searching...</ThemedText>
            </View>
          ) : searchQuery.trim().length > 0 && searchResults.length > 0 ? (
            <View style={styles.searchResultsContainer}>
              <ThemedText style={styles.resultsTitle}>
                Search Results ({searchResults.length})
              </ThemedText>
              
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.resultItem}
                  onPress={() => navigateToResult(result)}
                  accessibilityLabel={`${result.title} - ${getResultTypeLabel(result.type)}`}
                  accessibilityRole="button"
                >
                  <View style={styles.resultIconContainer}>
                    <IconSymbol
                      name={getFilterIcon(result.type)}
                      size={20}
                      color={getFilterColor(result.type)}
                    />
                  </View>
                  
                  <View style={styles.resultContent}>
                    <ThemedText type="defaultSemiBold" style={styles.resultTitle}>
                      {result.title}
                    </ThemedText>
                    
                    {result.description && (
                      <ThemedText
                        style={styles.resultDescription}
                        numberOfLines={2}
                      >
                        {result.description}
                      </ThemedText>
                    )}
                    
                    <View style={styles.resultMeta}>
                      <Chip
                        mode="flat"
                        style={[
                          styles.resultTypeChip,
                          { backgroundColor: getFilterColor(result.type) + '20' },
                        ]}
                        textStyle={[
                          styles.resultTypeChipText,
                          { color: getFilterColor(result.type) },
                        ]}
                      >
                        {getResultTypeLabel(result.type)}
                      </Chip>
                      
                      {result.tags && result.tags.length > 0 && (
                        <ThemedText style={styles.resultTags}>
                          {result.tags.join(' • ')}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : searchQuery.trim().length > 0 ? (
            <View style={styles.emptyResultsContainer}>
              <IconSymbol
                name="magnifyingglass"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <ThemedText style={styles.emptyResultsTitle}>
                No results found
              </ThemedText>
              <ThemedText style={styles.emptyResultsText}>
                Try different keywords or remove filters
              </ThemedText>
            </View>
          ) : recentSearches.length > 0 ? (
            <View style={styles.recentSearchesContainer}>
              <View style={styles.recentSearchesHeader}>
                <ThemedText style={styles.recentSearchesTitle}>
                  Recent Searches
                </ThemedText>
                <TouchableOpacity
                  onPress={clearRecentSearches}
                  accessibilityLabel="Clear recent searches"
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.clearRecentText}>Clear</ThemedText>
                </TouchableOpacity>
              </View>
              
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearchSelect(search)}
                  accessibilityLabel={`Recent search: ${search}`}
                  accessibilityRole="button"
                >
                  <IconSymbol
                    name="clock"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.recentSearchIcon}
                  />
                  <ThemedText style={styles.recentSearchText}>{search}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </ThemedView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  searchContainer: {
    flex: 1,
    maxHeight: Dimensions.get('window').height * 0.9,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 8,
    padding: 8,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersButtonText: {
    fontSize: 14,
    marginRight: 4,
  },
  filtersContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersContent: {
    padding: 8,
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#757575',
  },
  searchResultsContainer: {
    padding: 16,
  },
  resultsTitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultTypeChip: {
    height: 24,
    marginRight: 8,
  },
  resultTypeChipText: {
    fontSize: 12,
  },
  resultTags: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  emptyResultsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  recentSearchesContainer: {
    padding: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    color: '#757575',
  },
  clearRecentText: {
    fontSize: 14,
    color: COLORS.primary.main,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    fontSize: 16,
  },
});

export default GlobalSearch;
