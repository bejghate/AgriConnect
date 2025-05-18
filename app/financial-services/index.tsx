import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Card, Chip } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { useUser } from '@/context/UserContext';
import {
  financialProducts,
  financialInstitutions,
  financingApplications,
  FinancialProduct,
  FinancialInstitution,
  FinancingApplication
} from '@/data/financial-services';

// Financial product categories with icons
const productCategories = [
  { id: 'loan', name: 'Crédits', icon: 'dollarsign.circle.fill', color: '#4CAF50' },
  { id: 'insurance', name: 'Assurances', icon: 'shield.fill', color: '#2196F3' },
  { id: 'savings', name: 'Épargne', icon: 'banknote.fill', color: '#FF9800' },
  { id: 'all', name: 'Tous', icon: 'list.bullet', color: '#9C27B0' },
];

// Financial service features
const financialFeatures = [
  {
    id: 'products',
    title: 'Produits Financiers',
    description: 'Découvrez les offres de crédit, d\'assurance et d\'épargne adaptées à l\'agriculture',
    icon: 'bag.fill',
    color: '#4CAF50',
    route: '/financial-services/products'
  },
  {
    id: 'applications',
    title: 'Mes Demandes',
    description: 'Suivez l\'état de vos demandes de financement en cours',
    icon: 'doc.text.fill',
    color: '#2196F3',
    route: '/financial-services/applications'
  },
  {
    id: 'repayments',
    title: 'Remboursements',
    description: 'Gérez vos échéances de remboursement et effectuez vos paiements',
    icon: 'arrow.left.arrow.right',
    color: '#FF9800',
    route: '/financial-services/repayments'
  },
  {
    id: 'education',
    title: 'Éducation Financière',
    description: 'Apprenez à gérer efficacement vos finances agricoles',
    icon: 'book.fill',
    color: '#9C27B0',
    route: '/financial-services/education'
  },
  {
    id: 'calculators',
    title: 'Calculateurs',
    description: 'Simulez vos crédits, assurances et plans d\'épargne',
    icon: 'function',
    color: '#F44336',
    route: '/financial-services/calculators'
  }
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
  welcomeText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    width: 100,
  },
  selectedCategoryCard: {
    backgroundColor: '#e8f5e9',
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
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#757575',
  },
  productsContainer: {
    paddingBottom: 8,
  },
  productCard: {
    width: 280,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  productContent: {
    padding: 12,
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
    fontSize: 16,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  institutionLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  institutionName: {
    fontSize: 12,
    color: '#757575',
  },
  amountRange: {
    fontSize: 12,
    color: '#757575',
  },
  applicationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationTitle: {
    fontSize: 16,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  applicationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  applicationDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  applicationDetailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
  },
  viewAllButtonText: {
    color: '#4CAF50',
    marginRight: 4,
  },
  institutionsContainer: {
    paddingBottom: 8,
  },
  institutionCard: {
    alignItems: 'center',
    width: 100,
    marginRight: 12,
  },
  institutionCardLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  institutionCardName: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default function FinancialServicesScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<FinancialProduct[]>([]);
  const [recentApplications, setRecentApplications] = useState<FinancingApplication[]>([]);
  const [partnerInstitutions, setPartnerInstitutions] = useState<FinancialInstitution[]>([]);

  // Load financial services data
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          // Get featured products (first 3)
          setFeaturedProducts(financialProducts.slice(0, 3));

          // Get recent applications (if any)
          setRecentApplications(financingApplications);

          // Get partner institutions
          setPartnerInstitutions(financialInstitutions);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading financial data:', error);
        setIsLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // In a real app, this would refresh data from an API
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing financial data:', error);
      setRefreshing(false);
    }
  };

  // Navigate to product details
  const navigateToProductDetails = (productId: string) => {
    router.push(`/financial-services/product-details?id=${productId}`);
  };

  // Navigate to application details
  const navigateToApplicationDetails = (applicationId: string) => {
    router.push(`/financial-services/application-details?id=${applicationId}`);
  };

  // Navigate to feature
  const navigateToFeature = (route: string) => {
    router.push(route);
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof productCategories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategoryCard,
        { borderColor: item.color }
      ]}
      onPress={() => {
        if (selectedCategory === item.id) {
          setSelectedCategory(null);
        } else {
          setSelectedCategory(item.id);
          router.push(`/financial-services/products?category=${item.id}`);
        }
      }}
    >
      <ThemedView style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={24} color="white" />
      </ThemedView>

      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  // Render feature item
  const renderFeatureItem = ({ item }: { item: typeof financialFeatures[0] }) => (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={() => navigateToFeature(item.route)}
    >
      <ThemedView style={[styles.featureIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon} size={32} color="white" />
      </ThemedView>

      <ThemedView style={styles.featureContent}>
        <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
          {item.title}
        </ThemedText>

        <ThemedText style={styles.featureDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </ThemedView>

      <IconSymbol name="chevron.right" size={20} color="#757575" />
    </TouchableOpacity>
  );

  // Render product item
  const renderProductItem = ({ item }: { item: FinancialProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigateToProductDetails(item.id)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x150?text=Financial+Product' }}
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

        <ThemedText type="defaultSemiBold" style={styles.productTitle}>
          {item.name}
        </ThemedText>

        <ThemedText style={styles.productDescription} numberOfLines={2}>
          {item.shortDescription || item.description}
        </ThemedText>

        <ThemedView style={styles.productFooter}>
          <ThemedView style={styles.institutionContainer}>
            <Image
              source={{ uri: financialInstitutions.find(inst => inst.id === item.institutionId)?.logo || 'https://via.placeholder.com/40' }}
              style={styles.institutionLogo}
            />
            <ThemedText style={styles.institutionName} numberOfLines={1}>
              {financialInstitutions.find(inst => inst.id === item.institutionId)?.name}
            </ThemedText>
          </ThemedView>

          {item.minAmount && item.maxAmount && (
            <ThemedText style={styles.amountRange}>
              {item.minAmount.toLocaleString()} - {item.maxAmount.toLocaleString()} {item.currency}
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  // Render application item
  const renderApplicationItem = ({ item }: { item: FinancingApplication }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => navigateToApplicationDetails(item.id)}
    >
      <ThemedView style={styles.applicationHeader}>
        <ThemedText type="defaultSemiBold" style={styles.applicationTitle}>
          {financialProducts.find(prod => prod.id === item.productId)?.name}
        </ThemedText>

        <ThemedView style={[styles.statusBadge, {
          backgroundColor:
            item.status === 'approved' || item.status === 'disbursed' ? '#4CAF50' :
            item.status === 'under_review' || item.status === 'submitted' ? '#FF9800' :
            item.status === 'rejected' || item.status === 'cancelled' ? '#F44336' :
            '#2196F3'
        }]}>
          <ThemedText style={styles.statusText}>
            {item.status === 'approved' ? 'Approuvé' :
             item.status === 'under_review' ? 'En cours' :
             item.status === 'submitted' ? 'Soumis' :
             item.status === 'rejected' ? 'Rejeté' :
             item.status === 'disbursed' ? 'Décaissé' :
             item.status === 'cancelled' ? 'Annulé' :
             item.status}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.applicationDetails}>
        <ThemedView style={styles.applicationDetailItem}>
          <IconSymbol name="dollarsign.circle.fill" size={16} color="#757575" />
          <ThemedText style={styles.applicationDetailText}>
            {item.amount.toLocaleString()} {item.currency}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.applicationDetailItem}>
          <IconSymbol name="calendar" size={16} color="#757575" />
          <ThemedText style={styles.applicationDetailText}>
            {new Date(item.submissionDate || item.createdAt).toLocaleDateString()}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.applicationDetailItem}>
          <IconSymbol name="building.2.fill" size={16} color="#757575" />
          <ThemedText style={styles.applicationDetailText}>
            {financialInstitutions.find(inst => inst.id === item.institutionId)?.name}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  // Render institution item
  const renderInstitutionItem = ({ item }: { item: FinancialInstitution }) => (
    <TouchableOpacity
      style={styles.institutionCard}
      onPress={() => router.push(`/financial-services/products?institution=${item.id}`)}
    >
      <Image
        source={{ uri: item.logo }}
        style={styles.institutionCardLogo}
      />

      <ThemedText style={styles.institutionCardName} numberOfLines={2}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement des services financiers...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Services Financiers</ThemedText>
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
        <ThemedText style={styles.welcomeText}>
          Accédez à des solutions financières adaptées à vos besoins agricoles
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Catégories de Produits
        </ThemedText>

        <FlatList
          data={productCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Services Disponibles
        </ThemedText>

        <FlatList
          data={financialFeatures}
          renderItem={renderFeatureItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        {featuredProducts.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Produits Recommandés
            </ThemedText>

            <FlatList
              data={featuredProducts}
              renderItem={renderProductItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            />
          </>
        )}

        {recentApplications.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Mes Demandes Récentes
            </ThemedText>

            <FlatList
              data={recentApplications}
              renderItem={renderApplicationItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push('/financial-services/applications')}
            >
              <ThemedText style={styles.viewAllButtonText}>
                Voir toutes mes demandes
              </ThemedText>
              <IconSymbol name="chevron.right" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </>
        )}

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Nos Partenaires Financiers
        </ThemedText>

        <FlatList
          data={partnerInstitutions}
          renderItem={renderInstitutionItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.institutionsContainer}
        />
      </ScrollView>
    </ThemedView>
  );
}
