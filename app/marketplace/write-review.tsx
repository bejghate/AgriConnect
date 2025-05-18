import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { 
  sellerProfiles,
  marketplaceListings,
  SellerProfile,
  MarketplaceListing
} from '@/data/marketplace';

export default function WriteReviewScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [targetName, setTargetName] = useState('');
  const [targetImage, setTargetImage] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch data from an API
    const loadData = async () => {
      setTimeout(() => {
        if (type === 'seller') {
          const seller = sellerProfiles.find(s => s.id === id);
          if (seller) {
            setTargetName(seller.name);
            setTargetImage(seller.profileImage || '');
          }
        } else if (type === 'listing') {
          const listing = marketplaceListings.find(l => l.id === id);
          if (listing) {
            setTargetName(listing.title);
            const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
            setTargetImage(primaryImage?.url || '');
          }
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    loadData();
  }, [id, type]);
  
  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleAddImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleSubmit = () => {
    if (!isOnline) {
      Alert.alert('Offline Mode', 'You cannot submit reviews while offline. Please try again when you have an internet connection.');
      return;
    }
    
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    
    if (!comment.trim()) {
      Alert.alert('Review Required', 'Please write a review before submitting.');
      return;
    }
    
    // In a real app, this would send the review to an API
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }, 1500);
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading...</ThemedText>
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Write a Review</ThemedText>
        
        <ThemedView style={{ width: 60 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Reviews will be submitted when you're back online.
          </ThemedText>
        </ThemedView>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.targetContainer}>
          {targetImage ? (
            <Image 
              source={{ uri: targetImage }} 
              style={styles.targetImage}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
          ) : (
            <ThemedView style={styles.targetImagePlaceholder}>
              <IconSymbol 
                name={type === 'seller' ? "person.fill" : "shippingbox.fill"} 
                size={24} 
                color="#757575" 
              />
            </ThemedView>
          )}
          
          <ThemedText type="defaultSemiBold" style={styles.targetName}>
            {targetName}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.ratingContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Rating</ThemedText>
          
          <ThemedView style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRatingPress(star)}
                style={styles.starButton}
              >
                <IconSymbol 
                  name={star <= rating ? "star.fill" : "star"} 
                  size={36} 
                  color={star <= rating ? "#FFC107" : "#e0e0e0"} 
                />
              </TouchableOpacity>
            ))}
          </ThemedView>
          
          <ThemedText style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : 
              rating === 1 ? 'Poor' : 
              rating === 2 ? 'Fair' : 
              rating === 3 ? 'Good' : 
              rating === 4 ? 'Very Good' : 'Excellent'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.reviewContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Review</ThemedText>
          
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience with this product or seller..."
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
          />
        </ThemedView>
        
        <ThemedView style={styles.imagesContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Add Photos (Optional)</ThemedText>
          
          <ThemedView style={styles.imagesList}>
            {images.map((image, index) => (
              <ThemedView key={index} style={styles.imageItem}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.previewImage}
                  contentFit="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <IconSymbol name="xmark.circle.fill" size={20} color="white" />
                </TouchableOpacity>
              </ThemedView>
            ))}
            
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <IconSymbol name="camera.fill" size={24} color="#757575" />
                <ThemedText style={styles.addImageText}>Add Photo</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
          
          <ThemedText style={styles.imageHint}>
            Add up to 3 photos to help others see your experience
          </ThemedText>
        </ThemedView>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (rating === 0 || !comment.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !comment.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
          )}
        </TouchableOpacity>
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  targetImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  targetImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetName: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#757575',
  },
  reviewContainer: {
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    marginBottom: 24,
  },
  imagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imageItem: {
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
  },
  imageHint: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#b0bec5',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
