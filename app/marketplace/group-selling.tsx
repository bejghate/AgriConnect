import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Chip } from 'react-native-paper';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import {
  groupSellingListings,
  GroupSelling,
  productCategories
} from '@/data/marketplace';

// Group selling item component
const GroupSellingItem = ({ item, onPress }: { item: GroupSelling, onPress: (item: GroupSelling) => void }) => {
  return (
    <TouchableOpacity style={styles.groupSellingItem} onPress={() => onPress(item)}>
      <Image
        source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }}
        style={styles.groupSellingImage}
        contentFit="cover"
      />

      <ThemedView style={styles.groupSellingContent}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.groupSellingTitle}>
          {item.title}
        </ThemedText>

        <ThemedView style={styles.groupSellingDetails}>
          <ThemedView style={styles.groupSellingDetail}>
            <IconSymbol name="person.2.fill" size={14} color="#0a7ea4" />
            <ThemedText style={styles.groupSellingDetailText}>
              {item.memberCount} members
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.groupSellingDetail}>
            <IconSymbol name="shippingbox.fill" size={14} color="#0a7ea4" />
            <ThemedText style={styles.groupSellingDetailText}>
              {item.totalQuantity.toLocaleString()} {item.quantityUnit}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.groupSellingPriceContainer}>
          <ThemedText style={styles.groupSellingPrice}>
            {item.pricePerUnit.toLocaleString()} {item.currency}/{item.quantityUnit}
          </ThemedText>

          {item.bulkDiscounts && item.bulkDiscounts.length > 0 && (
            <ThemedView style={styles.discountBadge}>
              <ThemedText style={styles.discountBadgeText}>
                Up to {Math.max(...item.bulkDiscounts.map(d => d.discountPercentage))}% off
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.groupSellingFooter}>
          <ThemedText style={styles.cooperativeName} numberOfLines={1}>
            {item.cooperativeName}
          </ThemedText>

          <ThemedView style={styles.certificationsContainer}>
            {item.qualityCertifications.map((cert, index) => (
              <ThemedView key={index} style={styles.certificationBadge}>
                <IconSymbol name="checkmark.seal.fill" size={12} color="#4CAF50" />
                <ThemedText style={styles.certificationText} numberOfLines={1}>
                  {cert}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8f4f8',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    color: '#757575',
    textAlign: 'center',
  },
  groupSellingItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupSellingImage: {
    width: 100,
    height: 140,
  },
  groupSellingContent: {
    flex: 1,
    padding: 12,
  },
  groupSellingTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  groupSellingDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  groupSellingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  groupSellingDetailText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  groupSellingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupSellingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupSellingFooter: {
    marginTop: 'auto',
  },
  cooperativeName: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  certificationText: {
    color: '#4CAF50',
    fontSize: 10,
    marginLeft: 2,
  },
});

export default function GroupSellingScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<GroupSelling[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setTimeout(() => {
        setListings(groupSellingListings);
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleListingPress = (listing: GroupSelling) => {
    router.push(`/marketplace/group-selling-detail?id=${listing.id}`);
  };

  const navigateBack = () => {
    router.back();
  };

  const filteredListings = selectedCategory
    ? listings.filter(listing => listing.productCategory === selectedCategory)
    : listings;

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading cooperative listings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={24} color="#0a7ea4" />
        </TouchableOpacity>
        <ThemedText type="title">Cooperative Group Selling</ThemedText>
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some features may be limited.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.infoContainer}>
        <IconSymbol name="info.circle.fill" size={20} color="#0a7ea4" />
        <ThemedText style={styles.infoText}>
          Group selling allows cooperatives and farmer associations to sell their products in bulk,
          often at better prices. Support local farming communities by buying directly from them.
        </ThemedText>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {productCategories.map(category => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => handleCategorySelect(category.id)}
            style={styles.categoryChip}
            selectedColor="#0a7ea4"
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      {filteredListings.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.circle" size={48} color="#757575" />
          <ThemedText style={styles.emptyText}>
            No cooperative listings found for this category.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={({ item }) => <GroupSellingItem item={item} onPress={handleListingPress} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}
