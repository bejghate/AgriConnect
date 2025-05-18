import React, { useState, useEffect } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import CacheService from '@/services/CacheService';
import { COLORS } from '@/constants/Theme';
import { useOffline } from '@/context/OfflineContext';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  placeholderSource?: number;
  cacheExpiry?: number;
  forceRefresh?: boolean;
  showLoadingIndicator?: boolean;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  placeholderSource,
  cacheExpiry,
  forceRefresh = false,
  showLoadingIndicator = true,
  style,
  ...props
}) => {
  const { isOnline } = useOffline();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // If source is a number (local image), use it directly
        if (typeof source === 'number') {
          setImageUri(null);
          setIsLoading(false);
          return;
        }
        
        const uri = source.uri;
        
        // Skip caching for data URIs or non-http URIs
        if (uri.startsWith('data:') || !uri.startsWith('http')) {
          setImageUri(uri);
          setIsLoading(false);
          return;
        }
        
        // Try to get cached image
        const options = {
          expiry: cacheExpiry,
          forceRefresh: forceRefresh && isOnline, // Only force refresh if online
        };
        
        const cachedPath = await CacheService.cacheImage(uri, options);
        
        if (isMounted) {
          if (cachedPath) {
            setImageUri(cachedPath);
          } else {
            // If caching failed, use original URI
            setImageUri(uri);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading cached image:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [source, cacheExpiry, forceRefresh, isOnline]);

  // If it's a local image (number), render it directly
  if (typeof source === 'number') {
    return <Image source={source} style={style} {...props} />;
  }

  // Show loading indicator
  if (isLoading && showLoadingIndicator) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={COLORS.primary.main} />
      </View>
    );
  }

  // Show placeholder if there's an error or no image URI
  if (hasError || !imageUri) {
    if (placeholderSource) {
      return <Image source={placeholderSource} style={style} {...props} />;
    }
    return (
      <View style={[styles.errorContainer, style]}>
        <View style={styles.errorIcon} />
      </View>
    );
  }

  // Show the cached or original image
  return (
    <Image
      source={{ uri: imageUri }}
      style={style}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
});
