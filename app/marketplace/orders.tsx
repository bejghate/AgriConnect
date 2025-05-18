import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import { sampleOrders, Order, OrderStatus } from '@/data/marketplace';

// Order status badge component
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FFF9C4', text: '#FFA000' };
      case 'confirmed':
        return { bg: '#E3F2FD', text: '#1976D2' };
      case 'processing':
        return { bg: '#E8F5E9', text: '#388E3C' };
      case 'shipped':
        return { bg: '#E0F7FA', text: '#0097A7' };
      case 'delivered':
        return { bg: '#E8F5E9', text: '#388E3C' };
      case 'canceled':
        return { bg: '#FFEBEE', text: '#D32F2F' };
      default:
        return { bg: '#F5F5F5', text: '#757575' };
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };
  
  const colors = getStatusColor();
  
  return (
    <ThemedView style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <ThemedText style={[styles.statusText, { color: colors.text }]}>
        {getStatusText()}
      </ThemedText>
    </ThemedView>
  );
};

// Order card component
const OrderCard = ({ order, onPress }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => onPress(order.id)}
    >
      <ThemedView style={styles.orderHeader}>
        <ThemedView>
          <ThemedText type="defaultSemiBold" style={styles.orderNumber}>
            Order #{order.id.split('-')[1]}
          </ThemedText>
          <ThemedText style={styles.orderDate}>
            {formatDate(order.createdAt)}
          </ThemedText>
        </ThemedView>
        
        <OrderStatusBadge status={order.status} />
      </ThemedView>
      
      <ThemedView style={styles.orderItems}>
        {order.items.map((item, index) => (
          <ThemedView key={item.id} style={styles.orderItem}>
            <Image
              source={{ uri: item.listingImage }}
              style={styles.itemImage}
              contentFit="cover"
              placeholder={require('@/assets/images/react-logo.png')}
              transition={200}
            />
            
            <ThemedView style={styles.itemDetails}>
              <ThemedText numberOfLines={1} style={styles.itemTitle}>
                {item.listingTitle}
              </ThemedText>
              
              <ThemedText style={styles.itemQuantity}>
                {item.quantity} x {item.unitPrice.toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
      
      <ThemedView style={styles.orderFooter}>
        <ThemedText style={styles.totalLabel}>Total:</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.totalAmount}>
          {order.totalAmount.toLocaleString()} XOF
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

export default function OrdersScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  
  useEffect(() => {
    // In a real app, this would fetch orders from an API
    const loadOrders = async () => {
      setTimeout(() => {
        setOrders(sampleOrders);
        setIsLoading(false);
      }, 1000);
    };
    
    loadOrders();
  }, []);
  
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'canceled'].includes(order.status);
    }
    return true;
  });
  
  const handleViewOrder = (orderId: string) => {
    router.push(`/marketplace/order-details?id=${orderId}`);
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
        
        <ThemedText type="subtitle" style={styles.headerTitle}>My Orders</ThemedText>
        
        <ThemedView style={{ width: 40 }} />
      </ThemedView>
      
      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. Some order information may not be up to date.
          </ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}
          >
            All
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}
          >
            Active
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}
          >
            Completed
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading orders...</ThemedText>
        </ThemedView>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onPress={handleViewOrder} 
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersContainer}
        />
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="bag" size={64} color="#e0e0e0" />
          <ThemedText type="subtitle" style={styles.emptyTitle}>No orders found</ThemedText>
          <ThemedText style={styles.emptyText}>
            {activeTab === 'all' 
              ? "You haven't placed any orders yet" 
              : activeTab === 'active' 
                ? "You don't have any active orders" 
                : "You don't have any completed orders"}
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  ordersContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderNumber: {
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#757575',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderItems: {
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
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
