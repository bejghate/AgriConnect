import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser, UserType } from '@/context/UserContext';
import { useOffline } from '@/context/OfflineContext';

import {
  marketplaceListings,
  productCategories,
  serviceCategories,
  MarketplaceListing
} from '@/data/marketplace';

// Category card component
const CategoryCard = ({ category, onPress }) => (
  <TouchableOpacity
    style={styles.categoryCard}
    onPress={onPress}
  >
    <ThemedView style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
      <IconSymbol name={category.icon} size={24} color="white" />
    </ThemedView>
    <ThemedText style={styles.categoryName} numberOfLines={2}>
      {category.name}
    </ThemedText>
  </TouchableOpacity>
);

// Product/Service card component
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

// Original category item component (kept for backward compatibility)
const CategoryItem = ({ category, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(category)}
    style={[styles.categoryItem, isSelected && styles.selectedCategoryItem]}
  >
    <IconSymbol
      size={24}
      name={category.icon}
      color={isSelected ? 'white' : '#0a7ea4'}
    />
    <ThemedText
      style={[styles.categoryName, isSelected && styles.selectedCategoryText]}
    >
      {category.name}
    </ThemedText>
  </TouchableOpacity>
);

// Original product card component (kept for backward compatibility)
const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity onPress={() => onPress(product)} style={styles.productCard}>
    <Image source={product.image} style={styles.productImage} />
    <ThemedView style={styles.productInfo}>
      <ThemedText type="defaultSemiBold" numberOfLines={1}>{product.name}</ThemedText>
      <ThemedText style={styles.productPrice}>${product.price.toFixed(2)}</ThemedText>
      <ThemedText style={styles.productSeller}>{product.seller}</ThemedText>
      <ThemedView style={styles.productFooter}>
        <ThemedView style={styles.ratingContainer}>
          <IconSymbol name="star.fill" size={14} color="#FFD700" />
          <ThemedText style={styles.ratingText}>{product.rating}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.locationContainer}>
          <IconSymbol name="location.fill" size={14} color="#0a7ea4" />
          <ThemedText style={styles.locationText}>{product.location}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  </TouchableOpacity>
);

export default function MarketplaceScreen() {
  const router = useRouter();
  const { userTypes, primaryUserType, isUserType } = useUser();
  const { isOnline } = useOffline();

  // Original state variables (kept for backward compatibility)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState<'buy' | 'sell'>('buy');
  const [userSpecificCategories, setUserSpecificCategories] = useState([]);

  // New state variables for enhanced marketplace
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featuredListings, setFeaturedListings] = useState<MarketplaceListing[]>([]);
  const [recentListings, setRecentListings] = useState<MarketplaceListing[]>([]);
  const [showEnhancedUI, setShowEnhancedUI] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // In a real app, this would fetch data from an API
      setTimeout(() => {
        const featured = marketplaceListings.filter(listing => listing.featured);

        // Sort by date posted (most recent first)
        const recent = [...marketplaceListings].sort((a, b) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        ).slice(0, 10);

        setFeaturedListings(featured);
        setRecentListings(recent);
        setIsLoading(false);
      }, 1000);
    };

    loadData();

    // Set the appropriate view mode based on user type (original functionality)
    if (isUserType('supplier') || isUserType('farmer') || isUserType('livestock')) {
      // These user types can sell products
      setViewMode(primaryUserType === 'buyer' ? 'buy' : 'sell');
    } else {
      // Default to buy mode for other user types
      setViewMode('buy');
    }

    // Filter categories based on user type (original functionality)
    filterCategoriesByUserType();
  }, [primaryUserType]);

  // Filter categories based on user type (original functionality)
  const filterCategoriesByUserType = () => {
    const categories = [
      { id: '1', name: 'Seeds & Plants', icon: 'leaf.fill' },
      { id: '2', name: 'Equipment', icon: 'wrench.fill' },
      { id: '3', name: 'Livestock', icon: 'hare.fill' },
      { id: '4', name: 'Fertilizers', icon: 'drop.fill' },
      { id: '5', name: 'Pesticides', icon: 'ladybug.fill' },
      { id: '6', name: 'Services', icon: 'person.fill' },
    ];

    let filteredCategories = [...categories];

    if (isUserType('farmer')) {
      // Farmers are more interested in these categories
      filteredCategories = categories.filter(cat =>
        ['Seeds & Plants', 'Equipment', 'Fertilizers', 'Pesticides', 'Services'].includes(cat.name)
      );
    } else if (isUserType('livestock')) {
      // Livestock managers are more interested in these categories
      filteredCategories = categories.filter(cat =>
        ['Livestock', 'Equipment', 'Services'].includes(cat.name)
      );
      // Add a specific category for livestock feed if it doesn't exist
      if (!filteredCategories.some(cat => cat.name === 'Animal Feed')) {
        filteredCategories.push({ id: '7', name: 'Animal Feed', icon: 'leaf.fill' });
      }
    } else if (isUserType('supplier')) {
      // Keep all categories for suppliers
    } else if (isUserType('professional')) {
      // Professionals might be more interested in services
      filteredCategories = categories.filter(cat =>
        ['Services', 'Equipment'].includes(cat.name)
      );
    } else if (isUserType('buyer')) {
      // Keep all categories for buyers
    }

    setUserSpecificCategories(filteredCategories);
  };

  // New functions for enhanced marketplace
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/marketplace/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateToCategory = (type: 'product' | 'service', categoryId: string) => {
    router.push(`/marketplace/category?type=${type}&categoryId=${categoryId}`);
  };

  const navigateToListing = (listingId: string) => {
    router.push(`/marketplace/listing?id=${listingId}`);
  };

  const navigateToAllProducts = () => {
    router.push('/marketplace/all-products');
  };

  const navigateToAllServices = () => {
    router.push('/marketplace/all-services');
  };

  const navigateToCart = () => {
    router.push('/marketplace/cart');
  };

  const navigateToOrders = () => {
    router.push('/marketplace/orders');
  };

  const navigateToCreateListing = () => {
    router.push('/marketplace/create-listing');
  };

  // Original functions (kept for backward compatibility)
  const handleCategoryPress = (category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
  };

  const handleProductPress = (product) => {
    console.log('Product pressed:', product.name);
    // Navigation to product detail would go here
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'buy' ? 'sell' : 'buy');
  };

  const toggleUI = () => {
    setShowEnhancedUI(!showEnhancedUI);
  };

  const filteredProducts = [
    {
      id: '101',
      name: 'Organic Tomato Seeds',
      category: 'Seeds & Plants',
      price: 12.99,
      seller: 'Green Thumb Farms',
      location: '15 km away',
      rating: 4.8,
      image: require('@/assets/images/react-logo.png'),
    },
    {
      id: '102',
      name: 'Tractor Rental - Daily',
      category: 'Equipment',
      price: 150.00,
      seller: 'AgriMachines Co.',
      location: '8 km away',
      rating: 4.6,
      image: require('@/assets/images/react-logo.png'),
    },
    {
      id: '103',
      name: 'Dairy Cow - Holstein',
      category: 'Livestock',
      price: 1200.00,
      seller: 'Meadow Livestock',
      location: '22 km away',
      rating: 4.9,
      image: require('@/assets/images/react-logo.png'),
    },
    {
      id: '104',
      name: 'Organic Compost - 50kg',
      category: 'Fertilizers',
      price: 45.50,
      seller: 'EcoFarm Supplies',
      location: '5 km away',
      rating: 4.7,
      image: require('@/assets/images/react-logo.png'),
    },
    {
      id: '105',
      name: 'Irrigation System Installation',
      category: 'Services',
      price: 350.00,
      seller: 'WaterWise Solutions',
      location: '18 km away',
      rating: 4.5,
      image: require('@/assets/images/react-logo.png'),
    },
  ].filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory.name : true;
    return matchesSearch && matchesCategory;
  });

  // Get user-specific marketplace title (original functionality)
  const getMarketplaceTitle = () => {
    if (viewMode === 'sell') {
      return 'Sell Your Products';
    } else {
      return 'Agricultural Marketplace';
    }
  };

  // Get user-specific marketplace intro text (original functionality)
  const getMarketplaceIntro = () => {
    if (viewMode === 'sell') {
      if (isUserType('supplier')) {
        return 'List your agricultural supplies and reach farmers directly through our marketplace.';
      } else if (isUserType('farmer') || isUserType('livestock')) {
        return 'Sell your farm products directly to buyers without intermediaries.';
      }
    } else {
      if (isUserType('farmer') || isUserType('livestock')) {
        return 'Find quality agricultural inputs and equipment for your farming operations.';
      } else if (isUserType('buyer')) {
        return 'Connect directly with farmers and suppliers to purchase fresh agricultural products.';
      }
    }

    return 'Buy and sell agricultural products, equipment, and services directly from other farmers and suppliers.';
  };

  if (isLoading && showEnhancedUI) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading marketplace...</ThemedText>
      </ThemedView>
    );
  }

  // Enhanced UI
  if (showEnhancedUI) {
    return (
      <ParallaxScrollView
        headerImage={require('@/assets/images/react-logo.png')}
        headerTitle="Agricultural Marketplace"
        headerSubtitle="Buy and sell agricultural products and services"
        headerRightContent={
          <ThemedView style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => router.push('/marketplace/messages')}
            >
              <IconSymbol name="bubble.left.fill" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={navigateToOrders}
            >
              <IconSymbol name="list.bullet" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={navigateToCart}
            >
              <IconSymbol name="cart.fill" size={24} color="white" />
            </TouchableOpacity>
          </ThemedView>
        }
      >
        <TouchableOpacity
          style={styles.uiToggleButton}
          onPress={toggleUI}
        >
          <ThemedText style={styles.uiToggleText}>Switch to Classic UI</ThemedText>
        </TouchableOpacity>

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
            placeholder="Search products and services..."
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

        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Product Categories
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {productCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => navigateToCategory('product', category.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllProducts}
            >
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#0a7ea4" />
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Service Categories
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {serviceCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => navigateToCategory('service', category.id)}
              />
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={navigateToAllServices}
            >
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#0a7ea4" />
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>

        {featuredListings.length > 0 && (
          <ThemedView style={styles.sectionContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Featured Listings
            </ThemedText>

            <FlatList
              data={featuredListings}
              renderItem={({ item }) => (
                <ListingCard
                  item={item}
                  onPress={() => navigateToListing(item.id)}
                />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
            />
          </ThemedView>
        )}

        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Listings
          </ThemedText>

          <FlatList
            data={recentListings}
            renderItem={({ item }) => (
              <ListingCard
                item={item}
                onPress={() => navigateToListing(item.id)}
              />
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.recentListingsContainer}
          />
        </ThemedView>

        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Special Features
          </ThemedText>

          <ThemedView style={styles.specialFeaturesContainer}>
            <TouchableOpacity
              style={styles.specialFeatureButton}
              onPress={() => router.push('/marketplace/market-statistics')}
            >
              <ThemedView style={styles.specialFeatureContent}>
                <IconSymbol name="chart.line.uptrend.xyaxis" size={32} color="#0a7ea4" />
                <ThemedView style={styles.specialFeatureTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.specialFeatureTitle}>
                    Market Statistics
                  </ThemedText>
                  <ThemedText style={styles.specialFeatureDescription}>
                    View price trends, regional comparisons, and market forecasts
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color="#757575" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.specialFeatureButton}
              onPress={() => router.push('/marketplace/group-selling')}
            >
              <ThemedView style={styles.specialFeatureContent}>
                <IconSymbol name="person.2.fill" size={32} color="#0a7ea4" />
                <ThemedView style={styles.specialFeatureTextContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.specialFeatureTitle}>
                    Cooperative Group Selling
                  </ThemedText>
                  <ThemedText style={styles.specialFeatureDescription}>
                    Buy directly from farmer cooperatives and associations
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color="#757575" />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity
          style={styles.sellButton}
          onPress={navigateToCreateListing}
        >
          <IconSymbol name="plus" size={20} color="white" style={styles.sellButtonIcon} />
          <ThemedText style={styles.sellButtonText}>
            Sell Something
          </ThemedText>
        </TouchableOpacity>
      </ParallaxScrollView>
    );
  }

  // Original UI (kept for backward compatibility)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D6E5FA', dark: '#2A3F5F' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name={viewMode === 'sell' ? 'shippingbox.fill' : 'cart.fill'}
          style={styles.headerImage}
        />
      }>
      <TouchableOpacity
        style={styles.uiToggleButton}
        onPress={toggleUI}
      >
        <ThemedText style={styles.uiToggleText}>Switch to Enhanced UI</ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{getMarketplaceTitle()}</ThemedText>
      </ThemedView>

      <ThemedText style={styles.introText}>
        {getMarketplaceIntro()}
      </ThemedText>

      {/* View mode toggle for users who can both buy and sell */}
      {(isUserType('supplier') || isUserType('farmer') || isUserType('livestock')) && (
        <ThemedView style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'buy' && styles.activeViewModeButton]}
            onPress={() => setViewMode('buy')}
          >
            <IconSymbol name="cart.fill" size={16} color={viewMode === 'buy' ? 'white' : '#0a7ea4'} />
            <ThemedText style={[styles.viewModeText, viewMode === 'buy' && styles.activeViewModeText]}>
              Buy
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'sell' && styles.activeViewModeButton]}
            onPress={() => setViewMode('sell')}
          >
            <IconSymbol name="tag.fill" size={16} color={viewMode === 'sell' ? 'white' : '#0a7ea4'} />
            <ThemedText style={[styles.viewModeText, viewMode === 'sell' && styles.activeViewModeText]}>
              Sell
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      {viewMode === 'buy' ? (
        <>
          <ThemedView style={styles.searchContainer}>
            <IconSymbol name="magnifyingglass" size={20} color="#0a7ea4" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, services, or sellers"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </ThemedView>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {userSpecificCategories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategory?.id === category.id}
                onPress={handleCategoryPress}
              />
            ))}
          </ScrollView>

          <ThemedView style={styles.productsHeader}>
            <ThemedText type="subtitle">Products & Services</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.filterText}>Filter</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => <ProductCard product={item} onPress={handleProductPress} />}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.productsContainer}
            />
          ) : (
            <ThemedView style={styles.emptyStateContainer}>
              <ThemedText>No products found matching your criteria.</ThemedText>
            </ThemedView>
          )}
        </>
      ) : (
        // Sell mode UI
        <ThemedView style={styles.sellModeContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Listed Products</ThemedText>

          <ThemedView style={styles.emptyStateContainer}>
            <IconSymbol name="tag.fill" size={40} color="#0a7ea4" style={styles.emptyStateIcon} />
            <ThemedText style={styles.emptyStateTitle}>No Products Listed Yet</ThemedText>
            <ThemedText style={styles.emptyStateDescription}>
              Start selling by adding your agricultural products or services to the marketplace.
            </ThemedText>
          </ThemedView>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Seller Tools</ThemedText>

          <ThemedView style={styles.sellerToolsContainer}>
            <TouchableOpacity style={styles.sellerToolCard}>
              <IconSymbol name="chart.bar.fill" size={28} color="#4CAF50" style={styles.sellerToolIcon} />
              <ThemedText style={styles.sellerToolTitle}>Sales Analytics</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellerToolCard}>
              <IconSymbol name="person.3.fill" size={28} color="#2196F3" style={styles.sellerToolIcon} />
              <ThemedText style={styles.sellerToolTitle}>Customer Management</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellerToolCard}>
              <IconSymbol name="dollarsign.circle.fill" size={28} color="#FF9800" style={styles.sellerToolIcon} />
              <ThemedText style={styles.sellerToolTitle}>Pricing Guide</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}

      <TouchableOpacity
        style={styles.sellButton}
        onPress={navigateToCreateListing}
      >
        <IconSymbol name="plus" size={20} color="white" style={styles.sellButtonIcon} />
        <ThemedText style={styles.sellButtonText}>
          {viewMode === 'sell' ? 'Add New Product' : 'Sell Something'}
        </ThemedText>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // Original styles (kept for backward compatibility)
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  introText: {
    marginBottom: 24,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  activeViewModeButton: {
    backgroundColor: '#0a7ea4',
  },
  viewModeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#0a7ea4',
  },
  activeViewModeText: {
    color: 'white',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  filterText: {
    color: '#0a7ea4',
  },
  productsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginTop: 4,
  },
  productSeller: {
    fontSize: 14,
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateDescription: {
    textAlign: 'center',
    color: '#757575',
  },
  sellModeContainer: {
    marginBottom: 16,
  },
  sellerToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sellerToolCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  sellerToolIcon: {
    marginBottom: 8,
  },
  sellerToolTitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },

  // Shared styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 16,
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedCategoryItem: {
    backgroundColor: '#0a7ea4',
  },
  categoryName: {
    marginLeft: 8,
  },
  selectedCategoryText: {
    color: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 10,
    color: '#757575',
    maxWidth: 80,
  },
  sellButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sellButtonIcon: {
    marginRight: 8,
  },
  sellButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // New styles for enhanced marketplace
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
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
  uiToggleButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  uiToggleText: {
    color: '#0a7ea4',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionButton: {
    padding: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 100,
  },
  viewAllText: {
    color: '#0a7ea4',
    marginRight: 4,
  },
  listingsContainer: {
    paddingRight: 16,
  },
  recentListingsContainer: {
    gap: 16,
  },
  listingCard: {
    width: 220,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    marginRight: 16,
  },
  listingImage: {
    width: '100%',
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
    padding: 12,
  },
  listingTitle: {
    marginBottom: 8,
    height: 40,
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
  specialFeaturesContainer: {
    gap: 12,
  },
  specialFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  specialFeatureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialFeatureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  specialFeatureTitle: {
    marginBottom: 4,
  },
  specialFeatureDescription: {
    fontSize: 12,
    color: '#757575',
  },
});
