import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import {
  marketplaceListings,
  sellerProfiles,
  sampleConversations,
  SellerProfile,
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

          <ThemedText style={styles.dateText}>
            {new Date(item.datePosted).toLocaleDateString()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function SellerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [sellerListings, setSellerListings] = useState<MarketplaceListing[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');

  useEffect(() => {
    // In a real app, this would fetch data from an API
    const loadSellerData = async () => {
      setTimeout(() => {
        const foundSeller = sellerProfiles.find(s => s.id === id);

        if (foundSeller) {
          setSeller(foundSeller);

          // Get all listings from this seller
          const listings = marketplaceListings.filter(listing => listing.seller.id === id);
          setSellerListings(listings);
        }

        setIsLoading(false);
      }, 1000);
    };

    loadSellerData();
  }, [id]);

  const handleContact = () => {
    if (!seller) return;

    Linking.openURL(`tel:${seller.contactInfo.phone}`);
  };

  const handleEmailContact = () => {
    if (!seller || !seller.contactInfo.email) return;

    Linking.openURL(`mailto:${seller.contactInfo.email}`);
  };

  const handleWebsiteVisit = () => {
    if (!seller || !seller.contactInfo.website) return;

    Linking.openURL(`https://${seller.contactInfo.website}`);
  };

  const handleMessage = () => {
    if (!seller) return;

    // Check if there's an existing conversation with this seller
    const existingConversation = sampleConversations.find(
      conv => conv.participants.includes('user-1') &&
             conv.participants.includes(seller.id)
    );

    if (existingConversation) {
      // Navigate to existing conversation
      router.push(`/marketplace/chat?id=${existingConversation.id}`);
    } else {
      // In a real app, we would create a new conversation here
      // For now, we'll just navigate to the first conversation as a demo
      router.push(`/marketplace/chat?id=conv-1`);
    }
  };

  const navigateToListing = (listingId: string) => {
    router.push(`/marketplace/listing?id=${listingId}`);
  };

  const navigateBack = () => {
    router.back();
  };

  const filteredListings = sellerListings.filter(listing =>
    activeTab === 'products' ? listing.type === 'product' : listing.type === 'service'
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading seller profile...</ThemedText>
      </ThemedView>
    );
  }

  if (!seller) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText type="subtitle" style={styles.errorTitle}>Seller Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The seller profile you're looking for doesn't exist or has been removed.
        </ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.headerTitle}>Seller Profile</ThemedText>

        <ThemedView style={{ width: 24 }} />
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.profileHeader}>
          {seller.profileImage ? (
            <Image
              source={{ uri: seller.profileImage }}
              style={styles.profileImage}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
          ) : (
            <ThemedView style={styles.profileImagePlaceholder}>
              <IconSymbol name="person.fill" size={40} color="#757575" />
            </ThemedView>
          )}

          <ThemedView style={styles.profileInfo}>
            <ThemedView style={styles.nameContainer}>
              <ThemedText type="title" style={styles.sellerName}>{seller.name}</ThemedText>
              {seller.verified && (
                <IconSymbol name="checkmark.seal.fill" size={20} color="#4CAF50" />
              )}
            </ThemedView>

            <TouchableOpacity
              style={styles.ratingContainer}
              onPress={() => router.push(`/marketplace/reviews?id=${seller.id}&type=seller`)}
            >
              <ThemedText style={styles.ratingValue}>{seller.rating.toFixed(1)}</ThemedText>
              <IconSymbol name="star.fill" size={16} color="#FFC107" />
              <ThemedText style={styles.reviewCount}>({seller.reviewCount} reviews)</ThemedText>
              <IconSymbol name="chevron.right" size={12} color="#757575" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <ThemedView style={styles.locationContainer}>
              <IconSymbol name="mappin" size={16} color="#757575" />
              <ThemedText style={styles.locationText}>
                {seller.location.city}, {seller.location.region}
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.memberSince}>
              Member since {new Date(seller.memberSince).toLocaleDateString()}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>About</ThemedText>
          <ThemedText style={styles.description}>{seller.description}</ThemedText>
        </ThemedView>

        {seller.specialties && seller.specialties.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Specialties</ThemedText>
            <ThemedView style={styles.specialtiesContainer}>
              {seller.specialties.map((specialty, index) => (
                <ThemedView key={index} style={styles.specialtyBadge}>
                  <ThemedText style={styles.specialtyText}>{specialty}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        )}

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Contact Information</ThemedText>

          <ThemedView style={styles.contactActionsContainer}>
            <TouchableOpacity style={styles.contactActionButton} onPress={handleMessage}>
              <IconSymbol name="bubble.left.fill" size={24} color="#0a7ea4" />
              <ThemedText style={styles.contactActionText}>Message</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactActionButton} onPress={handleContact}>
              <IconSymbol name="phone.fill" size={24} color="#0a7ea4" />
              <ThemedText style={styles.contactActionText}>Call</ThemedText>
            </TouchableOpacity>

            {seller.contactInfo.email && (
              <TouchableOpacity style={styles.contactActionButton} onPress={handleEmailContact}>
                <IconSymbol name="envelope.fill" size={24} color="#0a7ea4" />
                <ThemedText style={styles.contactActionText}>Email</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          <ThemedView style={styles.contactItem}>
            <IconSymbol name="phone.fill" size={20} color="#0a7ea4" />
            <ThemedText style={styles.contactText}>{seller.contactInfo.phone}</ThemedText>
          </ThemedView>

          {seller.contactInfo.email && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={20} color="#0a7ea4" />
              <ThemedText style={styles.contactText}>{seller.contactInfo.email}</ThemedText>
            </ThemedView>
          )}

          {seller.contactInfo.website && (
            <ThemedView style={styles.contactItem}>
              <IconSymbol name="globe" size={20} color="#0a7ea4" />
              <ThemedText style={styles.contactText}>{seller.contactInfo.website}</ThemedText>
              <TouchableOpacity style={styles.contactButton} onPress={handleWebsiteVisit}>
                <ThemedText style={styles.contactButtonText}>Visit</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Listings</ThemedText>

          <ThemedView style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'products' && styles.activeTab]}
              onPress={() => setActiveTab('products')}
            >
              <ThemedText
                style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}
              >
                Products ({sellerListings.filter(l => l.type === 'product').length})
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'services' && styles.activeTab]}
              onPress={() => setActiveTab('services')}
            >
              <ThemedText
                style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}
              >
                Services ({sellerListings.filter(l => l.type === 'service').length})
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {filteredListings.length > 0 ? (
            <FlatList
              data={filteredListings}
              renderItem={({ item }) => (
                <ListingCard
                  item={item}
                  onPress={() => navigateToListing(item.id)}
                />
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listingsContainer}
            />
          ) : (
            <ThemedView style={styles.emptyListingsContainer}>
              <ThemedText style={styles.emptyListingsText}>
                No {activeTab} available from this seller.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
  },
  backButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviewCount: {
    marginLeft: 4,
    color: '#757575',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    color: '#757575',
  },
  memberSince: {
    fontSize: 12,
    color: '#757575',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    color: '#0a7ea4',
    fontSize: 14,
  },
  contactActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  contactActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  contactActionText: {
    marginTop: 8,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#0a7ea4',
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  listingsContainer: {
    gap: 16,
  },
  emptyListingsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyListingsText: {
    color: '#757575',
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
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
});
