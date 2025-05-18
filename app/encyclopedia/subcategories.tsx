import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useOffline } from '@/context/OfflineContext';
import { encyclopediaCategories, EncyclopediaCategory, EncyclopediaSubcategory } from '@/data/encyclopedia';

// Subcategory item component
const SubcategoryItem = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={styles.subcategoryItem}>
    <ThemedView style={styles.subcategoryContent}>
      <IconSymbol size={32} name={item.icon} color="#0a7ea4" style={styles.subcategoryIcon} />
      <ThemedView style={styles.subcategoryTextContainer}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <ThemedText numberOfLines={2} style={styles.subcategoryDescription}>
          {item.description}
        </ThemedText>
        <ThemedText style={styles.itemCount}>
          {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
        </ThemedText>
      </ThemedView>
      <IconSymbol size={20} name="chevron.right" color="#0a7ea4" />
    </ThemedView>
  </TouchableOpacity>
);

export default function SubcategoriesScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<EncyclopediaCategory | null>(null);
  const [subcategories, setSubcategories] = useState<EncyclopediaSubcategory[]>([]);

  useEffect(() => {
    const loadCategory = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use our mock data
        const foundCategory = encyclopediaCategories.find(cat => cat.id === categoryId);
        
        if (foundCategory) {
          setCategory(foundCategory);
          setSubcategories(foundCategory.subcategories);
        }
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  const handleSubcategoryPress = (subcategory: EncyclopediaSubcategory) => {
    router.push(`/encyclopedia/items?subcategoryId=${subcategory.id}`);
  };

  const navigateBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading subcategories...</ThemedText>
      </ThemedView>
    );
  }

  if (!category) {
    return (
      <ThemedView style={styles.errorContainer}>
        <IconSymbol size={48} name="exclamationmark.triangle" color="#F44336" />
        <ThemedText style={styles.errorText}>Category not found</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={200}
          color="#0a7ea4"
          name={category.icon}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={styles.categoryTitle}>{category.title}</ThemedText>
      
      <ThemedText style={styles.categoryDescription}>
        {category.description}
      </ThemedText>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some content may not be available.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>Subcategories</ThemedText>

      {subcategories.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol size={48} name="folder" color="#757575" />
          <ThemedText style={styles.emptyText}>No subcategories found</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={subcategories}
          renderItem={({ item }) => <SubcategoryItem item={item} onPress={handleSubcategoryPress} />}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.subcategoriesContainer}
        />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    right: 20,
    position: 'absolute',
    opacity: 0.8,
  },
  headerContainer: {
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
  categoryTitle: {
    marginBottom: 8,
  },
  categoryDescription: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  subcategoriesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  subcategoryItem: {
    width: '100%',
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subcategoryIcon: {
    marginRight: 16,
  },
  subcategoryTextContainer: {
    flex: 1,
  },
  subcategoryDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#757575',
  },
  itemCount: {
    marginTop: 8,
    fontSize: 12,
    color: '#0a7ea4',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyText: {
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
});
