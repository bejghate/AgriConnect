import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { 
  marketplaceListings, 
  productCategories, 
  serviceCategories,
  MarketplaceListing
} from '@/data/marketplace';

// Listing card component
const ListingCard = ({ item, onPress }) => {
  const primaryImage = item.images.find(img => img.isPrimary) || item.images[0];
  
  return (
    <TouchableOpacity 
      style={styles.listingCard}
      onPress={onPress}
    >
      <Image
        source={{ uri: primaryImage.url }}
        style={styles.listingImage}
        contentFit="cover"
        placeholder={require('@/assets/images/react-logo.png')}
        transition={200}
      />
      
      {item.featured && (
        <ThemedView style={styles.featuredBadge}>
          <ThemedText style={styles.featuredText}>Featured</ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.listingContent}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.listingTitle}>
          {item.title}
        </ThemedText>
        
        <ThemedView style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold" style={styles.priceAmount}>
            {item.price.amount.toLocaleString()} {item.price.currency}
          </ThemedText>
          {item.price.unit && (
            <ThemedText style={styles.priceUnit}>
              {item.price.unit}
            </ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.listingMeta}>
          <ThemedView style={styles.listingTypeContainer}>
            <IconSymbol 
              name={item.type === 'product' ? 'shippingbox.fill' : 'person.fill.checkmark'} 
              size={12} 
              color="white" 
            />
            <ThemedText style={styles.listingType}>
              {item.type === 'product' ? 'Product' : 'Service'}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.locationContainer}>
            <IconSymbol name="mappin.circle.fill" size={12} color="#757575" />
            <ThemedText style={styles.locationText} numberOfLines={1}>
              {item.location.city}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

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

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const initialQuery = params.query as string || '';
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [searchResults, setSearchResults] = useState<MarketplaceListing[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('relevance');
  
  useEffect(() => {
    // In a real app, this would load from storage
    setRecentSearches(['tractor rental', 'organic seeds', 'cattle feed', 'irrigation']);
    
    // If there's an initial query, perform search
    if (initialQuery) {
      handleSearch();
    } else {
      setIsLoading(false);
    }
  }, []);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, this would be an API call
    setTimeout(() => {
      let results = marketplaceListings.filter(listing => {
        // Search in title, description, and tags
        const matchesQuery = 
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply type filter if any
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(listing.type);
        
        // Apply category filter if any
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(listing.category);
        
        return matchesQuery && matchesType && matchesCategory;
      });
      
      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          results.sort((a, b) => a.price.amount - b.price.amount);
          break;
        case 'price_high':
          results.sort((a, b) => b.price.amount - a.price.amount);
          break;
        case 'recent':
          results.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
          break;
        case 'relevance':
        default:
          // For relevance, we could implement a more sophisticated algorithm
          // For now, we'll prioritize exact matches in title, then tags, then description
          results.sort((a, b) => {
            const aExactTitle = a.title.toLowerCase().includes(searchQuery.toLowerCase());
            const bExactTitle = b.title.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (aExactTitle && !bExactTitle) return -1;
            if (!aExactTitle && bExactTitle) return 1;
            
            const aExactTag = a.tags.some(tag => tag.toLowerCase() === searchQuery.toLowerCase());
            const bExactTag = b.tags.some(tag => tag.toLowerCase() === searchQuery.toLowerCase());
            
            if (aExactTag && !bExactTag) return -1;
            if (!aExactTag && bExactTag) return 1;
            
            return 0;
          });
          break;
      }
      
      setSearchResults(results);
      
      // Add to recent searches if not already there
      if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
        // In a real app, we would save this to storage
      }
      
      setIsLoading(false);
    }, 1000);
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
  
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };
  
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSortBy('relevance');
  };
  
  const navigateToListing = (listingId: string) => {
    router.push(`/marketplace/listing?id=${listingId}`);
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

      <ThemedText type="title" style={styles.title}>Search Marketplace</ThemedText>

      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          placeholder="Search products and services..."
          style={styles.searchInput}
          placeholderTextColor="#757575"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={!initialQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={styles.filtersContainer}>
        <ThemedView style={styles.filterSection}>
          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>Type</ThemedText>
          <ThemedView style={styles.filterChipsRow}>
            <FilterChip 
              label="Products" 
              isSelected={selectedTypes.includes('product')} 
              onPress={() => toggleTypeFilter('product')} 
            />
            <FilterChip 
              label="Services" 
              isSelected={selectedTypes.includes('service')} 
              onPress={() => toggleTypeFilter('service')} 
            />
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.filterSection}>
          <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>Sort By</ThemedText>
          <ThemedView style={styles.filterChipsRow}>
            <FilterChip 
              label="Relevance" 
              isSelected={sortBy === 'relevance'} 
              onPress={() => handleSortChange('relevance')} 
            />
            <FilterChip 
              label="Newest" 
              isSelected={sortBy === 'recent'} 
              onPress={() => handleSortChange('recent')} 
            />
            <FilterChip 
              label="Price: Low to High" 
              isSelected={sortBy === 'price_low'} 
              onPress={() => handleSortChange('price_low')} 
            />
            <FilterChip 
              label="Price: High to Low" 
              isSelected={sortBy === 'price_high'} 
              onPress={() => handleSortChange('price_high')} 
            />
          </ThemedView>
        </ThemedView>
        
        {(selectedTypes.length > 0 || selectedCategories.length > 0 || sortBy !== 'relevance') && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <ThemedText style={styles.clearFiltersText}>Clear All Filters</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={20} color="white" style={styles.searchButtonIcon} />
          <ThemedText style={styles.searchButtonText}>Search</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Search results may be limited.
          </ThemedText>
        </ThemedView>
      )}

      {isLoading ? (
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
                <ListingCard 
                  item={item} 
                  onPress={() => navigateToListing(item.id)} 
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
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    marginBottom: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
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
  clearFiltersButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFiltersText: {
    color: '#F44336',
  },
  searchButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  resultsCount: {
    marginBottom: 16,
    color: '#757575',
  },
  resultsContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  listingCard: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  listingImage: {
    width: 120,
    height: 120,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listingContent: {
    flex: 1,
    padding: 12,
  },
  listingTitle: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    color: '#0a7ea4',
    marginRight: 4,
  },
  priceUnit: {
    fontSize: 12,
    color: '#757575',
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listingType: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: '#757575',
    marginLeft: 4,
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
});
