import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { marketplaceListings, sampleConversations, MarketplaceListing } from '@/data/marketplace';

// Image carousel component
const ImageCarousel = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ThemedView style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideWidth = event.nativeEvent.layoutMeasurement.width;
          const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
          setActiveIndex(index);
        }}
      >
        {images.map((image, index) => (
          <Image
            key={image.id}
            source={{ uri: image.url }}
            style={styles.carouselImage}
            contentFit="cover"
            placeholder={require('@/assets/images/react-logo.png')}
            transition={200}
          />
        ))}
      </ScrollView>

      <ThemedView style={styles.paginationContainer}>
        {images.map((_, index) => (
          <ThemedView
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
};

// Specification item component
const SpecificationItem = ({ label, value }) => (
  <ThemedView style={styles.specificationItem}>
    <ThemedText style={styles.specificationLabel}>{label}</ThemedText>
    <ThemedText style={styles.specificationValue}>{value}</ThemedText>
  </ThemedView>
);

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    const loadListing = async () => {
      setTimeout(() => {
        const foundListing = marketplaceListings.find(item => item.id === id);
        setListing(foundListing || null);
        setIsLoading(false);
      }, 1000);
    };

    loadListing();
  }, [id]);

  const handleContact = () => {
    if (!listing) return;

    Alert.alert(
      'Contact Seller',
      'How would you like to contact the seller?',
      [
        {
          text: 'Message',
          onPress: () => {
            // Check if there's an existing conversation with this seller
            const existingConversation = sampleConversations.find(
              conv => conv.participants.includes('user-1') &&
                     conv.participants.includes(listing.seller.id) &&
                     conv.listingId === listing.id
            );

            if (existingConversation) {
              // Navigate to existing conversation
              router.push(`/marketplace/chat?id=${existingConversation.id}`);
            } else {
              // In a real app, we would create a new conversation here
              // For now, we'll just navigate to the first conversation as a demo
              router.push(`/marketplace/chat?id=conv-1`);
            }
          },
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${listing.seller.contactInfo.phone}`);
          },
        },
        listing.seller.contactInfo.email && {
          text: 'Email',
          onPress: () => {
            Linking.openURL(`mailto:${listing.seller.contactInfo.email}`);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ].filter(Boolean)
    );
  };

  const handleShare = async () => {
    if (!listing) return;

    try {
      await Share.share({
        message: `Check out this ${listing.type} on AgriConnect: ${listing.title}`,
        // In a real app, you would include a deep link URL here
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would save to storage or API
  };

  const navigateBack = () => {
    router.back();
  };

  const navigateToSeller = () => {
    if (!listing) return;
    router.push(`/marketplace/seller?id=${listing.seller.id}`);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading listing details...</ThemedText>
      </ThemedView>
    );
  }

  if (!listing) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
        <ThemedText type="subtitle" style={styles.errorTitle}>Listing Not Found</ThemedText>
        <ThemedText style={styles.errorText}>
          The listing you're looking for doesn't exist or has been removed.
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

        <ThemedView style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
            <IconSymbol
              name={isFavorite ? "heart.fill" : "heart"}
              size={24}
              color={isFavorite ? "#F44336" : "#0a7ea4"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#0a7ea4" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageCarousel images={listing.images} />

        <ThemedView style={styles.contentContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>{listing.title}</ThemedText>

            {listing.featured && (
              <ThemedView style={styles.featuredBadge}>
                <ThemedText style={styles.featuredText}>Featured</ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.priceContainer}>
            <ThemedText type="title" style={styles.price}>
              {listing.price.amount.toLocaleString()} {listing.price.currency}
            </ThemedText>
            {listing.price.unit && (
              <ThemedText style={styles.priceUnit}>
                {listing.price.unit}
              </ThemedText>
            )}
            {listing.price.negotiable && (
              <ThemedText style={styles.negotiableText}>Negotiable</ThemedText>
            )}
          </ThemedView>

          <ThemedView style={styles.metaContainer}>
            <ThemedView style={styles.metaItem}>
              <IconSymbol name="mappin" size={16} color="#757575" />
              <ThemedText style={styles.metaText}>
                {listing.location.city}, {listing.location.region}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.metaItem}>
              <IconSymbol name="calendar" size={16} color="#757575" />
              <ThemedText style={styles.metaText}>
                Posted: {new Date(listing.datePosted).toLocaleDateString()}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.typeContainer}>
              <IconSymbol
                name={listing.type === 'product' ? 'shippingbox.fill' : 'person.fill.checkmark'}
                size={12}
                color="white"
              />
              <ThemedText style={styles.typeText}>
                {listing.type === 'product' ? 'Product' : 'Service'}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Description</ThemedText>
            <ThemedText style={styles.description}>{listing.description}</ThemedText>
          </ThemedView>

          {listing.availability && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Availability</ThemedText>

              {listing.type === 'product' ? (
                <ThemedView style={styles.availabilityContainer}>
                  <ThemedView style={[
                    styles.availabilityIndicator,
                    { backgroundColor: listing.availability.inStock ? '#4CAF50' : '#F44336' }
                  ]} />
                  <ThemedText style={styles.availabilityText}>
                    {listing.availability.inStock
                      ? `In Stock (${listing.availability.quantity} available)`
                      : 'Out of Stock'}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={styles.availabilityText}>
                  Available from {new Date(listing.availability.availableFrom).toLocaleDateString()}
                  to {new Date(listing.availability.availableTo).toLocaleDateString()}
                </ThemedText>
              )}
            </ThemedView>
          )}

          {listing.specifications && Object.keys(listing.specifications).length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Specifications</ThemedText>

              <ThemedView style={styles.specificationsContainer}>
                {Object.entries(listing.specifications).map(([key, value], index) => (
                  <SpecificationItem
                    key={index}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={value.toString()}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          )}

          {listing.certifications && listing.certifications.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Certifications</ThemedText>

              <ThemedView style={styles.certificationsContainer}>
                {listing.certifications.map((certification, index) => (
                  <ThemedView key={index} style={styles.certificationBadge}>
                    <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" />
                    <ThemedText style={styles.certificationText}>{certification}</ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Seller Information</ThemedText>

            <TouchableOpacity style={styles.sellerCard} onPress={navigateToSeller}>
              <ThemedView style={styles.sellerInfo}>
                {listing.seller.profileImage ? (
                  <Image
                    source={{ uri: listing.seller.profileImage }}
                    style={styles.sellerImage}
                    contentFit="cover"
                    placeholder={require('@/assets/images/react-logo.png')}
                    transition={200}
                  />
                ) : (
                  <ThemedView style={styles.sellerImagePlaceholder}>
                    <IconSymbol name="person.fill" size={24} color="#757575" />
                  </ThemedView>
                )}

                <ThemedView style={styles.sellerDetails}>
                  <ThemedView style={styles.sellerNameContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.sellerName}>
                      {listing.seller.name}
                    </ThemedText>
                    {listing.seller.verified && (
                      <IconSymbol name="checkmark.seal.fill" size={16} color="#4CAF50" />
                    )}
                  </ThemedView>

                  <TouchableOpacity
                    style={styles.sellerRatingContainer}
                    onPress={() => router.push(`/marketplace/reviews?id=${listing.seller.id}&type=seller`)}
                  >
                    <ThemedText style={styles.sellerRating}>{listing.seller.rating.toFixed(1)}</ThemedText>
                    <IconSymbol name="star.fill" size={14} color="#FFC107" />
                    <ThemedText style={styles.reviewCount}>({listing.seller.reviewCount} reviews)</ThemedText>
                    <IconSymbol name="chevron.right" size={12} color="#757575" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>

                  <ThemedText style={styles.sellerLocation}>
                    {listing.seller.location.city}, {listing.seller.location.region}
                  </ThemedText>
                </ThemedView>

                <IconSymbol name="chevron.right" size={20} color="#757575" />
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionTitleContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Product Reviews</ThemedText>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push(`/marketplace/reviews?id=${listing.id}&type=listing`)}
              >
                <ThemedText style={styles.viewAllButtonText}>View All</ThemedText>
                <IconSymbol name="chevron.right" size={14} color="#0a7ea4" />
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.reviewsSummary}>
              <ThemedView style={styles.reviewsRatingContainer}>
                <ThemedText type="title" style={styles.reviewsRating}>
                  {listing.rating.toFixed(1)}
                </ThemedText>
                <ThemedView style={styles.reviewsStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <IconSymbol
                      key={star}
                      name={star <= Math.round(listing.rating) ? "star.fill" : "star"}
                      size={16}
                      color="#FFC107"
                    />
                  ))}
                </ThemedView>
                <ThemedText style={styles.reviewsCount}>
                  Based on {listing.reviewCount} reviews
                </ThemedText>
              </ThemedView>

              <TouchableOpacity
                style={styles.writeReviewButton}
                onPress={() => router.push(`/marketplace/write-review?id=${listing.id}&type=listing`)}
              >
                <IconSymbol name="square.and.pencil" size={14} color="white" />
                <ThemedText style={styles.writeReviewButtonText}>
                  Write a Review
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <IconSymbol name="phone.fill" size={20} color="white" style={styles.contactButtonIcon} />
          <ThemedText style={styles.contactButtonText}>Contact Seller</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  headerActions: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 24,
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
  carouselContainer: {
    height: 250,
    position: 'relative',
  },
  carouselImage: {
    width: 400,
    height: 250,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  featuredBadge: {
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    color: '#0a7ea4',
    marginRight: 4,
  },
  priceUnit: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  negotiableText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
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
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 16,
  },
  specificationsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  specificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specificationLabel: {
    color: '#757575',
  },
  specificationValue: {
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  certificationText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
  },
  sellerCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  sellerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    marginRight: 4,
  },
  sellerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerRating: {
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  sellerLocation: {
    fontSize: 12,
    color: '#757575',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  contactButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactButtonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#0a7ea4',
    fontSize: 14,
    marginRight: 4,
  },
  reviewsSummary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  reviewsRatingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsRating: {
    fontSize: 36,
    marginBottom: 8,
  },
  reviewsStars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewsCount: {
    color: '#757575',
    fontSize: 14,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
  },
  writeReviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
