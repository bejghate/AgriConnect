import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { 
  sampleReviews, 
  sellerProfiles,
  marketplaceListings,
  Review
} from '@/data/marketplace';

// Star rating component
const StarRating = ({ rating, size = 16, color = '#FFC107' }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    const name = i <= rating ? 'star.fill' : (i - 0.5 <= rating ? 'star.leadinghalf.filled' : 'star');
    stars.push(
      <IconSymbol key={i} name={name} size={size} color={color} style={{ marginRight: 2 }} />
    );
  }
  
  return (
    <ThemedView style={{ flexDirection: 'row' }}>
      {stars}
    </ThemedView>
  );
};

// Review item component
const ReviewItem = ({ review }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
  };
  
  return (
    <ThemedView style={styles.reviewItem}>
      <ThemedView style={styles.reviewHeader}>
        <ThemedView style={styles.reviewerInfo}>
          {review.reviewerImage ? (
            <Image 
              source={{ uri: review.reviewerImage }} 
              style={styles.reviewerImage}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
          ) : (
            <ThemedView style={styles.reviewerImagePlaceholder}>
              <IconSymbol name="person.fill" size={16} color="#757575" />
            </ThemedView>
          )}
          <ThemedText type="defaultSemiBold" style={styles.reviewerName}>
            {review.reviewerName}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.reviewDate}>
          {formatDate(review.timestamp)}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.ratingContainer}>
        <StarRating rating={review.rating} />
        <ThemedText type="defaultSemiBold" style={styles.ratingText}>
          {review.rating.toFixed(1)}
        </ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.reviewComment}>
        {review.comment}
      </ThemedText>
      
      {review.images && review.images.length > 0 && (
        <FlatList
          horizontal
          data={review.images}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: item }} 
              style={styles.reviewImage}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
          )}
          keyExtractor={(item, index) => `image-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reviewImagesContainer}
        />
      )}
      
      <ThemedView style={styles.reviewFooter}>
        <TouchableOpacity 
          style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
          onPress={handleHelpful}
        >
          <IconSymbol 
            name={isHelpful ? "hand.thumbsup.fill" : "hand.thumbsup"} 
            size={16} 
            color={isHelpful ? "white" : "#757575"} 
          />
          <ThemedText style={[
            styles.helpfulButtonText,
            isHelpful && styles.helpfulButtonTextActive
          ]}>
            Helpful ({review.helpful + (isHelpful ? 1 : 0)})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reportButton}>
          <IconSymbol name="flag" size={16} color="#757575" />
          <ThemedText style={styles.reportButtonText}>Report</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

export default function ReviewsScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [targetName, setTargetName] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState([0, 0, 0, 0, 0]);
  
  useEffect(() => {
    // In a real app, this would fetch reviews from an API
    const loadReviews = async () => {
      setTimeout(() => {
        // Filter reviews for the specified target
        const targetReviews = sampleReviews.filter(
          review => review.targetId === id && review.targetType === type
        );
        
        setReviews(targetReviews);
        
        // Calculate average rating
        if (targetReviews.length > 0) {
          const sum = targetReviews.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(sum / targetReviews.length);
          
          // Calculate rating counts
          const counts = [0, 0, 0, 0, 0];
          targetReviews.forEach(review => {
            counts[5 - review.rating]++;
          });
          setRatingCounts(counts);
        }
        
        // Get target name
        if (type === 'seller') {
          const seller = sellerProfiles.find(s => s.id === id);
          if (seller) {
            setTargetName(seller.name);
          }
        } else if (type === 'listing') {
          const listing = marketplaceListings.find(l => l.id === id);
          if (listing) {
            setTargetName(listing.title);
          }
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    loadReviews();
  }, [id, type]);
  
  const navigateBack = () => {
    router.back();
  };
  
  const handleWriteReview = () => {
    router.push(`/marketplace/write-review?id=${id}&type=${type}`);
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading reviews...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Reviews</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      <FlatList
        data={reviews}
        renderItem={({ item }) => <ReviewItem review={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <ThemedView style={styles.reviewsHeader}>
            <ThemedText type="title" style={styles.targetName}>
              {targetName}
            </ThemedText>
            
            <ThemedView style={styles.ratingOverview}>
              <ThemedView style={styles.averageRatingContainer}>
                <ThemedText type="title" style={styles.averageRating}>
                  {averageRating.toFixed(1)}
                </ThemedText>
                <StarRating rating={averageRating} size={24} />
                <ThemedText style={styles.totalReviews}>
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.ratingBarsContainer}>
                {[5, 4, 3, 2, 1].map(rating => (
                  <ThemedView key={rating} style={styles.ratingBarRow}>
                    <ThemedText style={styles.ratingBarLabel}>{rating}</ThemedText>
                    <ThemedView style={styles.ratingBarBackground}>
                      <ThemedView 
                        style={[
                          styles.ratingBarFill,
                          { 
                            width: `${reviews.length > 0 
                              ? (ratingCounts[5 - rating] / reviews.length) * 100 
                              : 0}%` 
                          }
                        ]}
                      />
                    </ThemedView>
                    <ThemedText style={styles.ratingBarCount}>
                      {ratingCounts[5 - rating]}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
            
            <TouchableOpacity style={styles.writeReviewButton} onPress={handleWriteReview}>
              <IconSymbol name="square.and.pencil" size={16} color="white" />
              <ThemedText style={styles.writeReviewButtonText}>
                Write a Review
              </ThemedText>
            </TouchableOpacity>
            
            {reviews.length === 0 && (
              <ThemedView style={styles.emptyReviewsContainer}>
                <IconSymbol name="star" size={48} color="#0a7ea4" />
                <ThemedText type="subtitle" style={styles.emptyReviewsTitle}>
                  No Reviews Yet
                </ThemedText>
                <ThemedText style={styles.emptyReviewsText}>
                  Be the first to review {targetName}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  headerTitle: {
    textAlign: 'center',
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
  listContent: {
    padding: 16,
  },
  reviewsHeader: {
    marginBottom: 24,
  },
  targetName: {
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  averageRatingContainer: {
    alignItems: 'center',
    marginRight: 24,
  },
  averageRating: {
    fontSize: 36,
    marginBottom: 8,
  },
  totalReviews: {
    marginTop: 8,
    color: '#757575',
  },
  ratingBarsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    width: 16,
    marginRight: 8,
    textAlign: 'center',
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  ratingBarCount: {
    width: 24,
    marginLeft: 8,
    textAlign: 'right',
    color: '#757575',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  writeReviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyReviewsTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyReviewsText: {
    textAlign: 'center',
    color: '#757575',
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  reviewerImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  reviewerName: {
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#757575',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
  },
  reviewComment: {
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewImagesContainer: {
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  helpfulButtonActive: {
    backgroundColor: '#4CAF50',
  },
  helpfulButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#757575',
  },
  helpfulButtonTextActive: {
    color: 'white',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reportButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#757575',
  },
});
