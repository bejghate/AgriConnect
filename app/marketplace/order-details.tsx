import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

// Order timeline item component
const TimelineItem = ({ title, date, isActive, isLast }) => (
  <ThemedView style={styles.timelineItem}>
    <ThemedView style={styles.timelineIconContainer}>
      <ThemedView 
        style={[
          styles.timelineIcon, 
          isActive ? styles.timelineIconActive : styles.timelineIconInactive
        ]}
      />
      {!isLast && (
        <ThemedView 
          style={[
            styles.timelineLine, 
            isActive ? styles.timelineLineActive : styles.timelineLineInactive
          ]}
        />
      )}
    </ThemedView>
    
    <ThemedView style={styles.timelineContent}>
      <ThemedText 
        style={[
          styles.timelineTitle, 
          isActive ? styles.timelineTitleActive : styles.timelineTitleInactive
        ]}
      >
        {title}
      </ThemedText>
      {date && (
        <ThemedText style={styles.timelineDate}>
          {new Date(date).toLocaleString()}
        </ThemedText>
      )}
    </ThemedView>
  </ThemedView>
);

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isOnline } = useOffline();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    // In a real app, this would fetch the order from an API
    const loadOrder = async () => {
      setTimeout(() => {
        const foundOrder = sampleOrders.find(o => o.id === id);
        setOrder(foundOrder || null);
        setIsLoading(false);
      }, 1000);
    };
    
    loadOrder();
  }, [id]);
  
  const handleCancelOrder = () => {
    if (!order) return;
    
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to cancel an order. Please try again when you have an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel Order',
          onPress: () => {
            // In a real app, this would call an API to cancel the order
            setOrder(prev => prev ? { ...prev, status: 'canceled' } : null);
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleContactSeller = () => {
    if (!order) return;
    
    // In a real app, this would open a chat with the seller or show contact options
    Alert.alert(
      'Contact Seller',
      'How would you like to contact the seller?',
      [
        {
          text: 'Call',
          onPress: () => {
            console.log('Calling seller...');
          }
        },
        {
          text: 'Message',
          onPress: () => {
            console.log('Messaging seller...');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const navigateBack = () => {
    router.back();
  };
  
  const getOrderTimeline = () => {
    if (!order) return [];
    
    const timeline = [
      {
        title: 'Order Placed',
        date: order.createdAt,
        isActive: true,
      },
      {
        title: 'Order Confirmed',
        date: order.status === 'pending' ? null : order.updatedAt,
        isActive: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
      },
      {
        title: 'Processing',
        date: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
          ? order.updatedAt 
          : null,
        isActive: ['processing', 'shipped', 'delivered'].includes(order.status),
      },
      {
        title: 'Shipped',
        date: order.status === 'shipped' || order.status === 'delivered' ? order.updatedAt : null,
        isActive: ['shipped', 'delivered'].includes(order.status),
      },
      {
        title: 'Delivered',
        date: order.status === 'delivered' ? order.actualDeliveryDate || order.updatedAt : null,
        isActive: order.status === 'delivered',
      },
    ];
    
    if (order.status === 'canceled') {
      return [
        {
          title: 'Order Placed',
          date: order.createdAt,
          isActive: true,
        },
        {
          title: 'Order Canceled',
          date: order.updatedAt,
          isActive: true,
        },
      ];
    }
    
    return timeline;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        
        <ThemedText type="subtitle" style={styles.headerTitle}>Order Details</ThemedText>
        
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
      
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading order details...</ThemedText>
        </ThemedView>
      ) : !order ? (
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#F44336" />
          <ThemedText type="subtitle" style={styles.errorTitle}>Order Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The order you're looking for doesn't exist or has been removed.
          </ThemedText>
          <TouchableOpacity style={styles.backToOrdersButton} onPress={navigateBack}>
            <ThemedText style={styles.backToOrdersButtonText}>Back to Orders</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.orderHeader}>
            <ThemedView>
              <ThemedText type="subtitle" style={styles.orderNumber}>
                Order #{order.id.split('-')[1]}
              </ThemedText>
              <ThemedText style={styles.orderDate}>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
            
            <OrderStatusBadge status={order.status} />
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Order Timeline</ThemedText>
            
            <ThemedView style={styles.timeline}>
              {getOrderTimeline().map((item, index, array) => (
                <TimelineItem 
                  key={index}
                  title={item.title}
                  date={item.date}
                  isActive={item.isActive}
                  isLast={index === array.length - 1}
                />
              ))}
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Items</ThemedText>
            
            {order.items.map(item => (
              <ThemedView key={item.id} style={styles.orderItem}>
                <Image
                  source={{ uri: item.listingImage }}
                  style={styles.itemImage}
                  contentFit="cover"
                  placeholder={require('@/assets/images/react-logo.png')}
                  transition={200}
                />
                
                <ThemedView style={styles.itemDetails}>
                  <ThemedText style={styles.itemTitle}>
                    {item.listingTitle}
                  </ThemedText>
                  
                  <ThemedView style={styles.itemPriceRow}>
                    <ThemedText style={styles.itemQuantity}>
                      {item.quantity} x {item.unitPrice.toLocaleString()} XOF
                    </ThemedText>
                    <ThemedText style={styles.itemTotal}>
                      {item.totalPrice.toLocaleString()} XOF
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Delivery Information</ThemedText>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Delivery Method:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.deliveryMethod === 'local_delivery' 
                  ? 'Local Delivery' 
                  : order.deliveryMethod === 'pickup_only' 
                    ? 'Pickup' 
                    : 'Shipping'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Delivery Address:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                {', '}
                {order.deliveryAddress.city}
                {', '}
                {order.deliveryAddress.region}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Recipient:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.deliveryAddress.fullName}, {order.deliveryAddress.phoneNumber}
              </ThemedText>
            </ThemedView>
            
            {order.trackingNumber && (
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Tracking Number:</ThemedText>
                <ThemedText style={styles.infoValue}>{order.trackingNumber}</ThemedText>
              </ThemedView>
            )}
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Estimated Delivery:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.estimatedDeliveryDate 
                  ? new Date(order.estimatedDeliveryDate).toLocaleDateString() 
                  : 'To be determined'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Payment Information</ThemedText>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Method:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.paymentMethod === 'mobile_money' 
                  ? 'Mobile Money' 
                  : order.paymentMethod === 'cash_on_delivery' 
                    ? 'Cash on Delivery' 
                    : 'Bank Transfer'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Status:</ThemedText>
              <ThemedView 
                style={[
                  styles.paymentStatusBadge,
                  order.paymentStatus === 'paid' 
                    ? styles.paidBadge 
                    : order.paymentStatus === 'pending' 
                      ? styles.pendingBadge 
                      : styles.failedBadge
                ]}
              >
                <ThemedText 
                  style={[
                    styles.paymentStatusText,
                    order.paymentStatus === 'paid' 
                      ? styles.paidText 
                      : order.paymentStatus === 'pending' 
                        ? styles.pendingText 
                        : styles.failedText
                  ]}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Order Summary</ThemedText>
            
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {(order.totalAmount - order.deliveryFee).toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {order.deliveryFee.toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.summaryRow}>
              <ThemedText type="defaultSemiBold" style={styles.totalLabel}>Total</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalValue}>
                {order.totalAmount.toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleContactSeller}
            >
              <IconSymbol name="message.fill" size={20} color="#0a7ea4" />
              <ThemedText style={styles.contactButtonText}>Contact Seller</ThemedText>
            </TouchableOpacity>
            
            {order.status === 'pending' && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelOrder}
              >
                <IconSymbol name="xmark.circle" size={20} color="#F44336" />
                <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ScrollView>
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
  backToOrdersButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToOrdersButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  timelineIconActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timelineIconInactive: {
    backgroundColor: 'white',
    borderColor: '#bdbdbd',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: '#4CAF50',
  },
  timelineLineInactive: {
    backgroundColor: '#bdbdbd',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    marginBottom: 4,
    fontWeight: '500',
  },
  timelineTitleActive: {
    color: '#4CAF50',
  },
  timelineTitleInactive: {
    color: '#757575',
  },
  timelineDate: {
    fontSize: 12,
    color: '#757575',
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    marginBottom: 8,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
  },
  itemTotal: {
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '500',
  },
  paymentStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
  },
  pendingBadge: {
    backgroundColor: '#FFF9C4',
  },
  failedBadge: {
    backgroundColor: '#FFEBEE',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paidText: {
    color: '#388E3C',
  },
  pendingText: {
    color: '#FFA000',
  },
  failedText: {
    color: '#D32F2F',
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
    fontSize: 16,
  },
  totalValue: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  actionsContainer: {
    gap: 16,
  },
  contactButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
