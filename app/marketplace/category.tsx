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

// Filter option component
const FilterOption = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.filterOption, isSelected && styles.filterOptionSelected]}
    onPress={onPress}
  >
    <ThemedText 
      style={[styles.filterOptionText, isSelected && styles.filterOptionTextSelected]}
    >
      {label}
    </ThemedText>
  </TouchableOpacity>
);

// Sort option component
const SortOption = ({ label, value, selectedSort, onPress }) => (
  <TouchableOpacity
    style={[styles.sortOption, selectedSort === value && styles.sortOptionSelected]}
    onPress={() => onPress(value)}
  >
    <ThemedText 
      style={[styles.sortOptionText, selectedSort === value && styles.sortOptionTextSelected]}
    >
      {label}
    </ThemedText>
  </TouchableOpacity>
);

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
          <ThemedView style={styles.locationContainer}>
            <IconSymbol name="mappin.circle.fill" size={12} color="#757575" />
            <ThemedText style={styles.locationText} numberOfLines={1}>
              {item.location.city}
            </ThemedText>
          </ThemedView>
          
          <ThemedText style={styles.dateText}>
            {new Date(item.datePosted).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function CategoryScreen() {
  const router = useRouter();
  const { type, categoryId } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketplaceListing[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null]);
  
  // Get category information
  const category = type === 'product' 
    ? productCategories.find(cat => cat.id === categoryId)
    : serviceCategories.find(cat => cat.id === categoryId);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const loadListings = async () => {
      setTimeout(() => {
        const categoryListings = marketplaceListings.filter(listing => 
          listing.type === type && listing.category === categoryId
        );
        
        setListings(categoryListings);
        setFilteredListings(categoryListings);
        setIsLoading(false);
      }, 1000);
    };
    
    loadListings();
  }, [type, categoryId]);
  
  useEffect(() => {
    // Apply filters and sorting
    let result = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply price range filter
    if (priceRange[0] !== null) {
      result = result.filter(listing => listing.price.amount >= priceRange[0]);
    }
    
    if (priceRange[1] !== null) {
      result = result.filter(listing => listing.price.amount <= priceRange[1]);
    }
    
    // Apply sorting
    switch (selectedSort) {
      case 'recent':
        result.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
        break;
      case 'price_low':
        result.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_high':
        result.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    setFilteredListings(result);
  }, [listings, searchQuery, selectedSort, priceRange]);
  
  const handleSearch = () => {
    // Search is applied in the useEffect
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
  };
  
  const handleMinPriceChange = (value: string) => {
    setPriceRange([value ? parseInt(value) : null, priceRange[1]]);
  };
  
  const handleMaxPriceChange = (value: string) => {
    setPriceRange([priceRange[0], value ? parseInt(value) : null]);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSort('recent');
    setPriceRange([null, null]);
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

      <ThemedView style={styles.titleContainer}>
        <ThemedView style={[styles.categoryIconContainer, { backgroundColor: category?.color || '#0a7ea4' }]}>
          <IconSymbol name={category?.icon || 'tag.fill'} size={24} color="white" />
        </ThemedView>
        <ThemedText type="title" style={styles.title}>{category?.name || 'Category'}</ThemedText>
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some marketplace features may be limited.
          </ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          placeholder="Search in this category..."
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
      
      <ThemedView style={styles.filtersHeader}>
        <ThemedView style={styles.resultsCount}>
          <ThemedText>{filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}</ThemedText>
        </ThemedView>
        
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <IconSymbol name="line.3.horizontal.decrease" size={16} color="#0a7ea4" />
          <ThemedText style={styles.filterButtonText}>Filter & Sort</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {showFilters && (
        <ThemedView style={styles.filtersContainer}>
          <ThemedView style={styles.filterSection}>
            <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>Sort By</ThemedText>
            <ThemedView style={styles.sortOptions}>
              <SortOption 
                label="Most Recent" 
                value="recent" 
                selectedSort={selectedSort} 
                onPress={handleSortChange} 
              />
              <SortOption 
                label="Price: Low to High" 
                value="price_low" 
                selectedSort={selectedSort} 
                onPress={handleSortChange} 
              />
              <SortOption 
                label="Price: High to Low" 
                value="price_high" 
                selectedSort={selectedSort} 
                onPress={handleSortChange} 
              />
              <SortOption 
                label="Featured" 
                value="featured" 
                selectedSort={selectedSort} 
                onPress={handleSortChange} 
              />
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.filterSection}>
            <ThemedText type="defaultSemiBold" style={styles.filterSectionTitle}>Price Range</ThemedText>
            <ThemedView style={styles.priceRangeContainer}>
              <ThemedView style={styles.priceInputContainer}>
                <ThemedText style={styles.priceInputLabel}>Min</ThemedText>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={priceRange[0] !== null ? priceRange[0].toString() : ''}
                  onChangeText={handleMinPriceChange}
                />
              </ThemedView>
              
              <ThemedText style={styles.priceRangeSeparator}>to</ThemedText>
              
              <ThemedView style={styles.priceInputContainer}>
                <ThemedText style={styles.priceInputLabel}>Max</ThemedText>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Any"
                  keyboardType="numeric"
                  value={priceRange[1] !== null ? priceRange[1].toString() : ''}
                  onChangeText={handleMaxPriceChange}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>
          
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <ThemedText style={styles.clearFiltersText}>Clear All Filters</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading listings...</ThemedText>
        </ThemedView>
      ) : filteredListings.length > 0 ? (
        <FlatList
          data={filteredListings}
          renderItem={({ item }) => (
            <ListingCard 
              item={item} 
              onPress={() => navigateToListing(item.id)} 
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listingsContainer}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="magnifyingglass" size={48} color="#757575" />
          <ThemedText style={styles.emptyText}>No listings found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Try adjusting your filters or search terms
          </ThemedText>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
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
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#0a7ea4',
    marginLeft: 8,
  },
  filtersContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  sortOptionSelected: {
    backgroundColor: '#0a7ea4',
  },
  sortOptionText: {
    fontSize: 14,
  },
  sortOptionTextSelected: {
    color: 'white',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#0a7ea4',
  },
  filterOptionText: {
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  priceInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  priceRangeSeparator: {
    marginHorizontal: 12,
    color: '#757575',
  },
  clearFiltersButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  clearFiltersText: {
    color: '#F44336',
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
  listingsContainer: {
    paddingBottom: 16,
    gap: 16,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#757575',
  },
});
