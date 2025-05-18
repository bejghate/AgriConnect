import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Chip, Divider, Button } from 'react-native-paper';

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
  actionButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    color: '#F44336',
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
    paddingBottom: 32,
  },
  productImage: {
    width: '100%',
    height: 200,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  institutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  institutionLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  institutionName: {
    fontSize: 16,
    color: '#757575',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagChip: {
    margin: 4,
    backgroundColor: '#e8f5e9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  documentIcon: {
    marginRight: 8,
  },
  documentText: {
    fontSize: 16,
  },
  contactCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
  },
  contactButton: {
    marginTop: 8,
  },
  applyButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
});

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<FinancialProduct | null>(null);
  const [institution, setInstitution] = useState<FinancialInstitution | null>(null);
  
  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      try {
        // In a real app, this would fetch data from an API
        setTimeout(() => {
          const foundProduct = financialProducts.find(p => p.id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            const foundInstitution = financialInstitutions.find(i => i.id === foundProduct.institutionId);
            if (foundInstitution) {
              setInstitution(foundInstitution);
            }
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading product data:', error);
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadProductData();
    }
  }, [id]);
  
  // Navigate back
  const navigateBack = () => {
    router.back();
  };
  
  // Navigate to application form
  const navigateToApply = () => {
    if (product) {
      router.push(`/financial-services/apply?productId=${product.id}`);
    }
  };
  
  // Share product
  const shareProduct = async () => {
    if (product && institution) {
      try {
        await Share.share({
          message: `Découvrez ${product.name} de ${institution.name} sur AgriConnect. Un produit financier adapté aux agriculteurs.`,
          // In a real app, you would include a deep link to the product
          // url: `https://agriconnect.app/financial-services/product-details?id=${product.id}`
        });
      } catch (error) {
        console.error('Error sharing product:', error);
      }
    }
  };
  
  // Contact institution
  const contactInstitution = (method: 'phone' | 'email' | 'website') => {
    if (!institution) return;
    
    if (method === 'phone' && institution.contactPhone) {
      Linking.openURL(`tel:${institution.contactPhone}`);
    } else if (method === 'email' && institution.contactEmail) {
      Linking.openURL(`mailto:${institution.contactEmail}`);
    } else if (method === 'website' && institution.website) {
      Linking.openURL(institution.website);
    }
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={styles.loadingText}>Chargement du produit financier...</ThemedText>
      </ThemedView>
    );
  }
  
  if (!product || !institution) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#F44336" />
        <ThemedText style={styles.errorText}>Produit non trouvé</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={{ color: '#4CAF50' }}>Retour aux produits</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#4CAF50" />
        </TouchableOpacity>
        
        <ThemedText type="title" style={styles.headerTitle} numberOfLines={1}>
          Détails du Produit
        </ThemedText>
        
        <TouchableOpacity style={styles.actionButton} onPress={shareProduct}>
          <IconSymbol name="square.and.arrow.up" size={24} color="#4CAF50" />
        </TouchableOpacity>
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
      >
        <Image 
          source={{ uri: product.imageUrl || 'https://via.placeholder.com/800x400?text=Financial+Product' }}
          style={styles.productImage}
        />
        
        <ThemedView style={styles.productContent}>
          <ThemedView style={styles.productHeader}>
            <Chip 
              style={[styles.productTypeChip, { 
                backgroundColor: 
                  product.type === 'loan' ? '#4CAF50' : 
                  product.type === 'insurance' ? '#2196F3' : 
                  '#FF9800'
              }]}
            >
              {product.type === 'loan' ? 'Crédit' : 
               product.type === 'insurance' ? 'Assurance' : 
               'Épargne'}
            </Chip>
            
            {product.interestRate && (
              <ThemedText style={styles.interestRate}>
                {product.interestRate}% {product.interestType === 'reducing_balance' ? '(dégressif)' : ''}
              </ThemedText>
            )}
          </ThemedView>
          
          <ThemedText type="title" style={styles.productTitle}>
            {product.name}
          </ThemedText>
          
          <ThemedView style={styles.institutionContainer}>
            <Image 
              source={{ uri: institution.logo }}
              style={styles.institutionLogo}
            />
            <ThemedText style={styles.institutionName}>
              {institution.name}
            </ThemedText>
          </ThemedView>
          
          {product.tags && product.tags.length > 0 && (
            <ThemedView style={styles.tagsContainer}>
              {product.tags.map(tag => (
                <Chip key={tag} style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
            </ThemedView>
          )}
        </ThemedView>
        
        <ThemedText style={styles.sectionTitle}>Description</ThemedText>
        <ThemedText style={styles.description}>
          {product.description}
        </ThemedText>
        
        <ThemedText style={styles.sectionTitle}>Détails du produit</ThemedText>
        <ThemedView style={styles.detailsCard}>
          {product.minAmount && product.maxAmount && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Montant</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.minAmount.toLocaleString()} - {product.maxAmount.toLocaleString()} {product.currency}
              </ThemedText>
            </ThemedView>
          )}
          
          {product.minTerm && product.maxTerm && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Durée</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.minTerm} - {product.maxTerm} {
                  product.termUnit === 'days' ? 'jours' :
                  product.termUnit === 'weeks' ? 'semaines' :
                  product.termUnit === 'months' ? 'mois' :
                  'années'
                }
              </ThemedText>
            </ThemedView>
          )}
          
          {product.interestRate && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Taux d'intérêt</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.interestRate}% {
                  product.interestType === 'fixed' ? '(fixe)' :
                  product.interestType === 'variable' ? '(variable)' :
                  product.interestType === 'reducing_balance' ? '(dégressif)' :
                  product.interestType === 'flat' ? '(constant)' :
                  ''
                }
              </ThemedText>
            </ThemedView>
          )}
          
          {product.repaymentFrequency && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Fréquence de remboursement</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.repaymentFrequency === 'daily' ? 'Quotidienne' :
                 product.repaymentFrequency === 'weekly' ? 'Hebdomadaire' :
                 product.repaymentFrequency === 'biweekly' ? 'Bimensuelle' :
                 product.repaymentFrequency === 'monthly' ? 'Mensuelle' :
                 product.repaymentFrequency === 'quarterly' ? 'Trimestrielle' :
                 product.repaymentFrequency === 'biannually' ? 'Semestrielle' :
                 product.repaymentFrequency === 'annually' ? 'Annuelle' :
                 product.repaymentFrequency === 'custom' ? 'Personnalisée' :
                 'Aucune'}
              </ThemedText>
            </ThemedView>
          )}
          
          {product.gracePeriod && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Période de grâce</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.gracePeriod} {
                  product.termUnit === 'days' ? 'jours' :
                  product.termUnit === 'weeks' ? 'semaines' :
                  product.termUnit === 'months' ? 'mois' :
                  'années'
                }
              </ThemedText>
            </ThemedView>
          )}
          
          {product.processingTime && (
            <ThemedView style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Temps de traitement</ThemedText>
              <ThemedText style={styles.detailValue}>
                {product.processingTime} jours
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        {product.benefits && product.benefits.length > 0 && (
          <>
            <ThemedText style={styles.sectionTitle}>Avantages</ThemedText>
            {product.benefits.map((benefit, index) => (
              <ThemedView key={index} style={styles.benefitItem}>
                <IconSymbol 
                  name="checkmark.circle.fill" 
                  size={20} 
                  color="#4CAF50" 
                  style={styles.benefitIcon}
                />
                <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
              </ThemedView>
            ))}
          </>
        )}
        
        {product.requiredDocuments && product.requiredDocuments.length > 0 && (
          <>
            <ThemedText style={styles.sectionTitle}>Documents requis</ThemedText>
            {product.requiredDocuments.map((document, index) => (
              <ThemedView key={index} style={styles.documentItem}>
                <IconSymbol 
                  name="doc.text.fill" 
                  size={20} 
                  color="#2196F3" 
                  style={styles.documentIcon}
                />
                <ThemedText style={styles.documentText}>{document}</ThemedText>
              </ThemedView>
            ))}
          </>
        )}
        
        <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
        <ThemedView style={styles.contactCard}>
          <ThemedText style={styles.contactTitle}>
            {institution.name}
          </ThemedText>
          
          {institution.contactPhone && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol 
                name="phone.fill" 
                size={16} 
                color="#4CAF50" 
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                {institution.contactPhone}
              </ThemedText>
            </ThemedView>
          )}
          
          {institution.contactEmail && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol 
                name="envelope.fill" 
                size={16} 
                color="#4CAF50" 
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                {institution.contactEmail}
              </ThemedText>
            </ThemedView>
          )}
          
          {institution.website && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol 
                name="globe" 
                size={16} 
                color="#4CAF50" 
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                {institution.website}
              </ThemedText>
            </ThemedView>
          )}
          
          {institution.address && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol 
                name="mappin.fill" 
                size={16} 
                color="#4CAF50" 
                style={styles.contactIcon}
              />
              <ThemedText style={styles.contactText}>
                {institution.address.street ? `${institution.address.street}, ` : ''}
                {institution.address.city}, {institution.address.region}
              </ThemedText>
            </ThemedView>
          )}
          
          <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
            {institution.contactPhone && (
              <Button 
                mode="outlined" 
                icon="phone"
                onPress={() => contactInstitution('phone')}
                style={{ flex: 1, marginRight: 8 }}
              >
                Appeler
              </Button>
            )}
            
            {institution.contactEmail && (
              <Button 
                mode="outlined" 
                icon="email"
                onPress={() => contactInstitution('email')}
                style={{ flex: 1, marginLeft: 8 }}
              >
                Email
              </Button>
            )}
          </ThemedView>
          
          {institution.website && (
            <Button 
              mode="outlined" 
              icon="web"
              onPress={() => contactInstitution('website')}
              style={styles.contactButton}
            >
              Visiter le site web
            </Button>
          )}
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={styles.applyButtonContainer}>
        <Button 
          mode="contained" 
          onPress={navigateToApply}
          style={styles.applyButton}
          contentStyle={{ paddingVertical: 8 }}
        >
          Faire une demande
        </Button>
      </ThemedView>
    </ThemedView>
  );
}
