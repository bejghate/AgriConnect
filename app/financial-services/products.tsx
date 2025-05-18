import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Searchbar, Chip } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { 
  financialProducts, 
  financialInstitutions, 
  FinancialProduct,
  FinancialInstitution
} from '@/data/financial-services';

// Product types with icons
const productTypes = [
  { id: 'loan', name: 'Crédits', icon: 'dollarsign.circle.fill', color: '#4CAF50' },
  { id: 'insurance', name: 'Assurances', icon: 'shield.fill', color: '#2196F3' },
  { id: 'savings', name: 'Épargne', icon: 'banknote.fill', color: '#FF9800' },
  { id: 'all', name: 'Tous', icon: 'list.bullet', color: '#9C27B0' },
];

// Product categories with icons
const productCategories = [
  { id: 'equipment', name: 'Équipement', icon: 'wrench.fill', color: '#4CAF50' },
  { id: 'inputs', name: 'Intrants', icon: 'leaf.fill', color: '#2196F3' },
  { id: 'land', name: 'Foncier', icon: 'map.fill', color: '#FF9800' },
  { id: 'livestock', name: 'Élevage', icon: 'hare.fill', color: '#9C27B0' },
  { id: 'infrastructure', name: 'Infrastructure', icon: 'building.2.fill', color: '#F44336' },
  { id: 'working_capital', name: 'Fonds de roulement', icon: 'arrow.triangle.2.circlepath', color: '#607D8B' },
  { id: 'crop_insurance', name: 'Assurance récolte', icon: 'leaf.arrow.triangle.circlepath', color: '#009688' },
  { id: 'livestock_insurance', name: 'Assurance bétail', icon: 'hare.fill', color: '#795548' },
  { id: 'weather_insurance', name: 'Assurance climatique', icon: 'cloud.sun.fill', color: '#3F51B5' },
  { id: 'savings', name: 'Épargne', icon: 'banknote.fill', color: '#FFC107' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    padding: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: 'white',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersSectionTitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTypeButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 14,
  },
  categoriesScrollView: {
    marginBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    width: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  institutionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  institutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedInstitutionButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  institutionLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  institutionName: {
    fontSize: 14,
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#757575',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 4,
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productContent: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productTypeChip: {
    height: 24,
  },
  interestRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  productDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  productDetailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productInstitutionLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  productInstitutionName: {
    fontSize: 14,
    color: '#757575',
  },
  viewDetailsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewDetailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 4,
    color: '#9e9e9e',
    textAlign: 'center',
  },
});

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string, institution?: string }>();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category || null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(params.institution || null);
  const [products, setProducts] = useState<FinancialProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FinancialProduct[]>([]);
  const [sortOrder, setSortOrder] = useState<'default' | 'rate_asc' | 'rate_desc' | 'amount_asc' | 'amount_desc'>('default');
  
  // Load products data
  useEffect(() => {
    const loadProductsData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          setProducts(financialProducts);
          filterProducts(
            financialProducts,
            searchQuery,
            selectedType,
            selectedCategory,
            selectedInstitution,
            sortOrder
          );
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading products data:', error);
        setIsLoading(false);
      }
    };
    
    loadProductsData();
  }, [params.category, params.institution]);
  
  // Filter products based on search query, type, category, and institution
  const filterProducts = (
    allProducts: FinancialProduct[],
    query: string,
    type: string | null,
    category: string | null,
    institution: string | null,
    sort: string
  ) => {
    let filtered = [...allProducts];
    
    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(query.toLowerCase())) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      );
    }
    
    // Filter by type
    if (type && type !== 'all') {
      filtered = filtered.filter(product => product.type === type);
    }
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    
    // Filter by institution
    if (institution) {
      filtered = filtered.filter(product => product.institutionId === institution);
    }
    
    // Sort products
    if (sort === 'rate_asc') {
      filtered.sort((a, b) => (a.interestRate || 0) - (b.interestRate || 0));
    } else if (sort === 'rate_desc') {
      filtered.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    } else if (sort === 'amount_asc') {
      filtered.sort((a, b) => (a.minAmount || 0) - (b.minAmount || 0));
    } else if (sort === 'amount_desc') {
      filtered.sort((a, b) => (b.maxAmount || 0) - (a.maxAmount || 0));
    }
    
    setFilteredProducts(filtered);
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real app, this would refresh data from an API
      setTimeout(() => {
        filterProducts(
          products,
          searchQuery,
          selectedType,
          selectedCategory,
          selectedInstitution,
          sortOrder
        );
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing products data:', error);
      setRefreshing(false);
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterProducts(
      products,
      query,
      selectedType,
      selectedCategory,
      selectedInstitution,
      sortOrder
    );
  };
  
  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    const newType = selectedType === typeId ? null : typeId;
    setSelectedType(newType);
    filterProducts(
      products,
      searchQuery,
      newType,
      selectedCategory,
      selectedInstitution,
      sortOrder
    );
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    filterProducts(
      products,
      searchQuery,
      selectedType,
      newCategory,
      selectedInstitution,
      sortOrder
    );
  };
  
  // Handle institution selection
  const handleInstitutionSelect = (institutionId: string) => {
    const newInstitution = selectedInstitution === institutionId ? null : institutionId;
    setSelectedInstitution(newInstitution);
    filterProducts(
      products,
      searchQuery,
      selectedType,
      selectedCategory,
      newInstitution,
      sortOrder
    );
  };
  
  // Handle sort order change
  const handleSortOrderChange = () => {
    let newSortOrder: typeof sortOrder = 'default';
    
    if (sortOrder === 'default') {
      newSortOrder = 'rate_asc';
    } else if (sortOrder === 'rate_asc') {
      newSortOrder = 'rate_desc';
    } else if (sortOrder === 'rate_desc') {
      newSortOrder = 'amount_asc';
    } else if (sortOrder === 'amount_asc') {
      newSortOrder = 'amount_desc';
    }
    
    setSortOrder(newSortOrder);
    filterProducts(
      products,
      searchQuery,
      selectedType,
      selectedCategory,
      selectedInstitution,
      newSortOrder
    );
  };
  
  // Navigate to product details
  const navigateToProductDetails = (productId: string) => {
    router.push(`/financial-services/product-details?id=${productId}`);
  };
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Render product item
  const renderProductItem = ({ item }: { item: FinancialProduct }) => {
    const institution = financialInstitutions.find(inst => inst.id === item.institutionId);
    
    return (
      <ThemedView style={styles.productCard}>
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/800x400?text=Financial+Product' }}
          style={styles.productImage}
        />
        
        <ThemedView style={styles.productContent}>
          <ThemedView style={styles.productHeader}>
            <Chip 
              style={[styles.productTypeChip, { 
                backgroundColor: 
                  item.type === 'loan' ? '#4CAF50' : 
                  item.type === 'insurance' ? '#2196F3' : 
                  '#FF9800'
              }]}
            >
              {item.type === 'loan' ? 'Crédit' : 
               item.type === 'insurance' ? 'Assurance' : 
               'Épargne'}
            </Chip>
            
            {item.interestRate && (
              <ThemedText style={styles.interestRate}>
                {item.interestRate}%
              </ThemedText>
            )}
          </ThemedView>
          
          <ThemedText type="subtitle" style={styles.productTitle}>
            {item.name}
          </ThemedText>
          
          <ThemedText style={styles.productDescription} numberOfLines={3}>
            {item.shortDescription || item.description}
          </ThemedText>
          
          <ThemedView style={styles.productDetails}>
            {item.minAmount && item.maxAmount && (
              <ThemedView style={styles.productDetailItem}>
                <IconSymbol name="dollarsign.circle.fill" size={16} color="#757575" />
                <ThemedText style={styles.productDetailText}>
                  {item.minAmount.toLocaleString()} - {item.maxAmount.toLocaleString()} {item.currency}
                </ThemedText>
              </ThemedView>
            )}
            
            {item.minTerm && item.maxTerm && (
              <ThemedView style={styles.productDetailItem}>
                <IconSymbol name="calendar" size={16} color="#757575" />
                <ThemedText style={styles.productDetailText}>
                  {item.minTerm} - {item.maxTerm} {
                    item.termUnit === 'days' ? 'jours' :
                    item.termUnit === 'weeks' ? 'semaines' :
                    item.termUnit === 'months' ? 'mois' :
                    'années'
                  }
                </ThemedText>
              </ThemedView>
            )}
            
            {item.processingTime && (
              <ThemedView style={styles.productDetailItem}>
                <IconSymbol name="clock.fill" size={16} color="#757575" />
                <ThemedText style={styles.productDetailText}>
                  Traitement: {item.processingTime} jours
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          <ThemedView style={styles.productFooter}>
            <ThemedView style={styles.institutionContainer}>
              {institution && (
                <>
                  <Image 
                    source={{ uri: institution.logo }}
                    style={styles.productInstitutionLogo}
                  />
                  <ThemedText style={styles.productInstitutionName}>
                    {institution.name}
                  </ThemedText>
                </>
              )}
            </ThemedView>
            
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => navigateToProductDetails(item.id)}
            >
              <ThemedText style={styles.viewDetailsButtonText}>
                Voir détails
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    );
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement des produits financiers...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <ThemedText type="title" style={styles.headerTitle}>
          Produits Financiers
        </ThemedText>
        
        <ThemedView style={{ width: 24 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
          </ThemedText>
        </ThemedView>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Searchbar
          placeholder="Rechercher des produits financiers..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <ThemedView style={styles.filtersContainer}>
          <ThemedText style={styles.filtersSectionTitle}>
            Type de produit
          </ThemedText>
          
          <ThemedView style={styles.typesContainer}>
            {productTypes.map(type => (
              <TouchableOpacity 
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedType === type.id && styles.selectedTypeButton
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <IconSymbol 
                  name={type.icon} 
                  size={16} 
                  color={selectedType === type.id ? '#4CAF50' : '#757575'} 
                  style={styles.typeIcon}
                />
                <ThemedText style={styles.typeText}>{type.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
          
          <ThemedText style={styles.filtersSectionTitle}>
            Catégorie
          </ThemedText>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScrollView}
          >
            {productCategories.map(category => (
              <TouchableOpacity 
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton,
                  { borderColor: category.color }
                ]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <ThemedView style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <IconSymbol name={category.icon} size={20} color="white" />
                </ThemedView>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ThemedText style={styles.filtersSectionTitle}>
            Institution financière
          </ThemedText>
          
          <ThemedView style={styles.institutionsContainer}>
            {financialInstitutions.map(institution => (
              <TouchableOpacity 
                key={institution.id}
                style={[
                  styles.institutionButton,
                  selectedInstitution === institution.id && styles.selectedInstitutionButton
                ]}
                onPress={() => handleInstitutionSelect(institution.id)}
              >
                <Image 
                  source={{ uri: institution.logo }}
                  style={styles.institutionLogo}
                />
                <ThemedText style={styles.institutionName}>{institution.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.resultsContainer}>
          <ThemedView style={styles.resultsHeader}>
            <ThemedText style={styles.resultsCount}>
              {filteredProducts.length} produits trouvés
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.sortButton}
              onPress={handleSortOrderChange}
            >
              <ThemedText style={styles.sortButtonText}>
                {sortOrder === 'default' ? 'Trier par' : 
                 sortOrder === 'rate_asc' ? 'Taux ↑' : 
                 sortOrder === 'rate_desc' ? 'Taux ↓' : 
                 sortOrder === 'amount_asc' ? 'Montant ↑' : 
                 'Montant ↓'}
              </ThemedText>
              <IconSymbol name="arrow.up.arrow.down" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </ThemedView>
          
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <IconSymbol name="magnifyingglass" size={48} color="#e0e0e0" />
              <ThemedText style={styles.emptyText}>
                Aucun produit financier trouvé
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Essayez de modifier vos critères de recherche
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
