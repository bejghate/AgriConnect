import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { 
  sampleCart, 
  marketplaceListings, 
  CartItem,
  MarketplaceListing
} from '@/data/marketplace';

// Cart item component with quantity controls
const CartItemCard = ({ item, listing, onUpdateQuantity, onRemove }) => {
  const primaryImage = listing.images.find(img => img.isPrimary) || listing.images[0];
  
  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onRemove(item.id);
    }
  };
  
  return (
    <ThemedView style={styles.cartItemCard}>
      <Image
        source={{ uri: primaryImage.url }}
        style={styles.itemImage}
        contentFit="cover"
        placeholder={require('@/assets/images/react-logo.png')}
        transition={200}
      />
      
      <ThemedView style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.itemTitle}>
          {listing.title}
        </ThemedText>
        
        <ThemedView style={styles.sellerContainer}>
          <IconSymbol name="person.crop.circle" size={12} color="#757575" />
          <ThemedText style={styles.sellerName} numberOfLines={1}>
            {listing.seller.name}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.priceContainer}>
          <ThemedText style={styles.itemPrice}>
            {listing.price.amount.toLocaleString()} {listing.price.currency}
          </ThemedText>
          {listing.price.unit && (
            <ThemedText style={styles.priceUnit}>
              {listing.price.unit}
            </ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={handleDecrement}
          >
            <IconSymbol name="minus" size={16} color="#0a7ea4" />
          </TouchableOpacity>
          
          <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={handleIncrement}
          >
            <IconSymbol name="plus" size={16} color="#0a7ea4" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}
      >
        <IconSymbol name="trash" size={20} color="#F44336" />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default function CartScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemDetails, setCartItemDetails] = useState<{
    item: CartItem;
    listing: MarketplaceListing;
  }[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  useEffect(() => {
    // In a real app, this would fetch the cart from an API or local storage
    const loadCart = async () => {
      setTimeout(() => {
        setCartItems(sampleCart.items);
        setIsLoading(false);
      }, 1000);
    };
    
    loadCart();
  }, []);
  
  useEffect(() => {
    // Get the full details of each cart item by looking up the listing
    const itemsWithDetails = cartItems.map(item => {
      const listing = marketplaceListings.find(l => l.id === item.listingId);
      return {
        item,
        listing
      };
    }).filter(item => item.listing); // Filter out any items where the listing couldn't be found
    
    setCartItemDetails(itemsWithDetails);
  }, [cartItems]);
  
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          onPress: () => {
            setCartItems(prev => prev.filter(item => item.id !== itemId));
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          onPress: () => {
            setCartItems([]);
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const calculateSubtotal = () => {
    return cartItemDetails.reduce((total, { item, listing }) => {
      return total + (item.quantity * listing.price.amount);
    }, 0);
  };
  
  const handleCheckout = () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to complete your purchase. Please try again when you have an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsCheckingOut(true);
    
    // In a real app, this would submit the order to an API
    setTimeout(() => {
      setIsCheckingOut(false);
      router.push('/marketplace/checkout');
    }, 1500);
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  const navigateToMarketplace = () => {
    router.push('/marketplace');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Shopping Cart</ThemedText>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearCart}
          disabled={cartItems.length === 0}
        >
          <ThemedText 
            style={[
              styles.clearButtonText,
              cartItems.length === 0 && styles.disabledText
            ]}
          >
            Clear
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. You can view your cart, but you'll need to be online to checkout.
          </ThemedText>
        </ThemedView>
      )}
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading your cart...</ThemedText>
        </ThemedView>
      ) : cartItemDetails.length > 0 ? (
        <>
          <FlatList
            data={cartItemDetails}
            renderItem={({ item }) => (
              <CartItemCard 
                item={item.item} 
                listing={item.listing}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            )}
            keyExtractor={item => item.item.id}
            contentContainerStyle={styles.cartItemsContainer}
          />
          
          <ThemedView style={styles.summaryContainer}>
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {calculateSubtotal().toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.summaryValue}>To be calculated</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.summaryRow}>
              <ThemedText type="defaultSemiBold" style={styles.totalLabel}>Total</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalValue}>
                {calculateSubtotal().toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <IconSymbol name="bag" size={20} color="white" />
                  <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </ThemedView>
        </>
      ) : (
        <ThemedView style={styles.emptyCartContainer}>
          <IconSymbol name="cart" size={64} color="#e0e0e0" />
          <ThemedText type="subtitle" style={styles.emptyCartTitle}>Your cart is empty</ThemedText>
          <ThemedText style={styles.emptyCartText}>
            Add items from the marketplace to start shopping
          </ThemedText>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={navigateToMarketplace}
          >
            <IconSymbol name="bag" size={20} color="white" />
            <ThemedText style={styles.browseButtonText}>Browse Marketplace</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
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
  clearButton: {
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#F44336',
  },
  disabledText: {
    color: '#bdbdbd',
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
  cartItemsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    marginBottom: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  priceUnit: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 12,
    alignSelf: 'flex-start',
  },
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#757575',
  },
  summaryValue: {
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 18,
    color: '#0a7ea4',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCartTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartText: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
