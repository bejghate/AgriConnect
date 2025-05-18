import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import {
  encyclopediaCategories,
  EncyclopediaItem,
  EncyclopediaCategory
} from '@/data/encyclopedia';

// Result item component
const ResultItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.resultItem}>
    {item.images && item.images.length > 0 ? (
      <Image
        source={{ uri: item.images[0].url }}
        style={styles.resultImage}
        contentFit="cover"
        placeholder={require('@/assets/images/react-logo.png')}
        transition={200}
      />
    ) : (
      <ThemedView style={styles.placeholderImage}>
        <IconSymbol
          name={getIconForType(item.type)}
          size={24}
          color="#0a7ea4"
        />
      </ThemedView>
    )}
    <ThemedView style={styles.resultContent}>
      <ThemedText type="defaultSemiBold" numberOfLines={1}>
        {item.title}
      </ThemedText>
      <ThemedText numberOfLines={2} style={styles.resultDescription}>
        {item.shortDescription}
      </ThemedText>
      <ThemedView style={styles.resultMeta}>
        <ThemedView style={styles.resultTypeContainer}>
          <IconSymbol
            name={getIconForType(item.type)}
            size={10}
            color="white"
          />
          <ThemedText style={styles.resultType}>
            {getDisplayTypeForType(item.type)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

// Filter chip component
const FilterChip = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterChip,
      isSelected && styles.filterChipSelected
    ]}
  >
    <ThemedText
      style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextSelected
      ]}
    >
      {label}
    </ThemedText>
  </TouchableOpacity>
);

// Helper function to get icon for item type
const getIconForType = (type: string) => {
  switch (type) {
    case 'disease':
      return 'cross.case.fill';
    case 'pest':
      return 'ladybug.fill';
    case 'technique':
      return 'wrench.and.screwdriver.fill';
    case 'animal_breed':
      return 'pawprint.fill';
    case 'plant_variety':
      return 'leaf.fill';
    default:
      return 'info.circle.fill';
  }
};

// Helper function to get display type for item type
const getDisplayTypeForType = (type: string) => {
  switch (type) {
    case 'disease':
      return 'Disease';
    case 'pest':
      return 'Pest';
    case 'technique':
      return 'Technique';
    case 'animal_breed':
      return 'Animal Breed';
    case 'plant_variety':
      return 'Plant Variety';
    default:
      return 'General';
  }
};

export default function SearchScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<EncyclopediaItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<EncyclopediaCategory[]>([]);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Symptom search
  const [isSymptomSearch, setIsSymptomSearch] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [imageRecognitionResult, setImageRecognitionResult] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);

  useEffect(() => {
    // Load categories for filters
    setCategories(encyclopediaCategories);

    // In a real app, we would load recent searches from storage
    setRecentSearches(['wheat rust', 'cattle mastitis', 'soil pH', 'maize fertilizer']);
  }, []);

  // Voice search functionality
  const startVoiceSearch = async () => {
    try {
      setIsListening(true);

      // Check if speech recognition is available
      const isSpeechAvailable = await Speech.isAvailableAsync();
      if (!isSpeechAvailable) {
        Alert.alert('Error', 'Speech recognition is not available on this device.');
        setIsListening(false);
        return;
      }

      // Start listening (this is a simplified implementation)
      // In a real app, you would use a proper speech recognition API
      Alert.alert(
        'Voice Search',
        'What would you like to search for?',
        [
          {
            text: 'Cancel',
            onPress: () => setIsListening(false),
            style: 'cancel',
          },
          {
            text: 'Done',
            onPress: () => {
              // Simulate voice recognition result
              const demoQueries = [
                'tomato leaf spots',
                'cattle mastitis',
                'wheat rust',
                'soil fertility'
              ];
              const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
              setSearchQuery(randomQuery);
              setIsListening(false);
              handleSearch();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error with voice search:', error);
      setIsListening(false);
      Alert.alert('Error', 'There was a problem with voice recognition. Please try again.');
    }
  };

  // Image recognition functionality
  const startImageRecognition = async () => {
    try {
      // Request permission to access the camera roll
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsAnalyzingImage(true);

        // In a real app, you would send the image to an API for analysis
        // For now, we'll simulate image recognition with a timeout
        setTimeout(() => {
          // Simulate recognition results
          const possibleResults = [
            'late blight',
            'powdery mildew',
            'aphid infestation',
            'nutrient deficiency'
          ];
          const recognizedIssue = possibleResults[Math.floor(Math.random() * possibleResults.length)];

          setImageRecognitionResult(recognizedIssue);
          setSearchQuery(recognizedIssue);
          setIsAnalyzingImage(false);
          handleSearch();
        }, 2000);
      }
    } catch (error) {
      console.error('Error with image recognition:', error);
      setIsAnalyzingImage(false);
      Alert.alert('Error', 'There was a problem with image recognition. Please try again.');
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // In a real app, this would be an API call
    // For now, we'll search our mock data
    setTimeout(() => {
      const results: EncyclopediaItem[] = [];

      for (const category of encyclopediaCategories) {
        for (const subcategory of category.subcategories) {
          for (const item of subcategory.items) {
            // Apply type filters if any are selected
            if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
              continue;
            }

            // Apply category filters if any are selected
            if (selectedCategories.length > 0 && !selectedCategories.includes(category.id)) {
              continue;
            }

            // Search in title, description, and tags
            const matchesQuery =
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.fullDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            // If symptom search is enabled, also search in symptoms
            const matchesSymptoms = isSymptomSearch && item.symptoms ?
              item.symptoms.some(symptom =>
                symptom.toLowerCase().includes(searchQuery.toLowerCase())
              ) : false;

            if (matchesQuery || matchesSymptoms) {
              results.push(item);
            }
          }
        }
      }

      setSearchResults(results);

      // Add to recent searches if not already there
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
        // In a real app, we would save this to storage
      }

      setIsSearching(false);
    }, 500); // Simulate network delay
  };

  const handleItemPress = (item: EncyclopediaItem) => {
    if (item.type === 'animal_breed') {
      router.push(`/encyclopedia/breed-detail?itemId=${item.id}`);
    } else if (item.type === 'plant_variety') {
      router.push(`/encyclopedia/variety-detail?itemId=${item.id}`);
    } else {
      router.push(`/encyclopedia/detail?itemId=${item.id}`);
    }
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setIsSymptomSearch(false);
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={styles.title}>Advanced Search</ThemedText>

      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          placeholder="Search the encyclopedia..."
          style={styles.searchInput}
          placeholderTextColor="#757575"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.advancedSearchOptions}>
        <TouchableOpacity
          style={styles.advancedSearchButton}
          onPress={startVoiceSearch}
          disabled={isListening}
        >
          <IconSymbol
            name="mic.fill"
            size={20}
            color={isListening ? "#999" : "#0a7ea4"}
          />
          <ThemedText style={styles.advancedSearchButtonText}>
            {isListening ? "Listening..." : "Voice Search"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.advancedSearchButton}
          onPress={startImageRecognition}
          disabled={isAnalyzingImage}
        >
          <IconSymbol
            name="camera.fill"
            size={20}
            color={isAnalyzingImage ? "#999" : "#0a7ea4"}
          />
          <ThemedText style={styles.advancedSearchButtonText}>
            {isAnalyzingImage ? "Analyzing..." : "Image Recognition"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {imageRecognitionResult && (
        <ThemedView style={styles.recognitionResultContainer}>
          <ThemedText style={styles.recognitionResultLabel}>
            Recognized as:
          </ThemedText>
          <ThemedText style={styles.recognitionResultText}>
            {imageRecognitionResult}
          </ThemedText>
        </ThemedView>
      )}

      <ScrollView style={styles.filtersScrollView}>
        <ThemedView style={styles.filtersSection}>
          <ThemedView style={styles.filtersSectionHeader}>
            <ThemedText type="defaultSemiBold">Filter by Type</ThemedText>
          </ThemedView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
            <FilterChip
              label="Disease"
              isSelected={selectedTypes.includes('disease')}
              onPress={() => toggleTypeFilter('disease')}
            />
            <FilterChip
              label="Pest"
              isSelected={selectedTypes.includes('pest')}
              onPress={() => toggleTypeFilter('pest')}
            />
            <FilterChip
              label="Technique"
              isSelected={selectedTypes.includes('technique')}
              onPress={() => toggleTypeFilter('technique')}
            />
            <FilterChip
              label="Animal Breed"
              isSelected={selectedTypes.includes('animal_breed')}
              onPress={() => toggleTypeFilter('animal_breed')}
            />
            <FilterChip
              label="Plant Variety"
              isSelected={selectedTypes.includes('plant_variety')}
              onPress={() => toggleTypeFilter('plant_variety')}
            />
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.filtersSection}>
          <ThemedView style={styles.filtersSectionHeader}>
            <ThemedText type="defaultSemiBold">Filter by Category</ThemedText>
          </ThemedView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
            {categories.map(category => (
              <FilterChip
                key={category.id}
                label={category.title}
                isSelected={selectedCategories.includes(category.id)}
                onPress={() => toggleCategoryFilter(category.id)}
              />
            ))}
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.filtersSection}>
          <ThemedView style={styles.filtersSectionHeader}>
            <ThemedText type="defaultSemiBold">Search Options</ThemedText>
          </ThemedView>
          <ThemedView style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setIsSymptomSearch(!isSymptomSearch)}
            >
              <ThemedText>Search in symptoms</ThemedText>
              <ThemedView
                style={[
                  styles.checkbox,
                  isSymptomSearch && styles.checkboxSelected
                ]}
              >
                {isSymptomSearch && (
                  <IconSymbol name="checkmark" size={16} color="white" />
                )}
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {(selectedTypes.length > 0 || selectedCategories.length > 0 || isSymptomSearch) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <ThemedText style={styles.clearFiltersText}>Clear All Filters</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={20} color="white" style={styles.searchButtonIcon} />
          <ThemedText style={styles.searchButtonText}>Search</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Search results may be limited.
          </ThemedText>
        </ThemedView>
      )}

      {isSearching ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Searching...</ThemedText>
        </ThemedView>
      ) : searchQuery ? (
        searchResults.length > 0 ? (
          <>
            <ThemedText style={styles.resultsCount}>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
            </ThemedText>
            <FlatList
              data={searchResults}
              renderItem={({ item }) => (
                <ResultItem
                  item={item}
                  onPress={handleItemPress}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.resultsContainer}
            />
          </>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol size={48} name="magnifyingglass" color="#757575" />
            <ThemedText style={styles.emptyText}>No results found</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Try different keywords or adjust your filters
            </ThemedText>
          </ThemedView>
        )
      ) : (
        <ThemedView style={styles.recentSearchesContainer}>
          <ThemedText type="defaultSemiBold" style={styles.recentSearchesTitle}>
            Recent Searches
          </ThemedText>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch();
              }}
            >
              <IconSymbol name="clock" size={16} color="#757575" />
              <ThemedText style={styles.recentSearchText}>{search}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  title: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  advancedSearchOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  advancedSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  advancedSearchButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#0a7ea4',
  },
  recognitionResultContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recognitionResultLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  recognitionResultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  filtersScrollView: {
    maxHeight: 300,
  },
  filtersSection: {
    marginBottom: 16,
  },
  filtersSectionHeader: {
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#0a7ea4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  optionsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0a7ea4',
  },
  clearFiltersButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  clearFiltersText: {
    color: '#F44336',
  },
  searchButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  searchButtonIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsCount: {
    marginBottom: 16,
    color: '#757575',
  },
  resultsContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  resultImage: {
    width: 80,
    height: 80,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    padding: 12,
  },
  resultDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    marginBottom: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  resultType: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    color: '#757575',
  },
  recentSearchesContainer: {
    flex: 1,
    marginTop: 16,
  },
  recentSearchesTitle: {
    marginBottom: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recentSearchText: {
    marginLeft: 12,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
});
