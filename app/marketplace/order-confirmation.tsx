import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  
  // In a real app, this would be passed from the checkout screen or fetched from an API
  const orderNumber = 'AGC-' + Math.floor(100000 + Math.random() * 900000);
  const orderDate = new Date().toLocaleDateString();
  const estimatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  const navigateToOrders = () => {
    router.push('/marketplace/orders');
  };
  
  const navigateToMarketplace = () => {
    router.push('/marketplace');
  };
  
  const shareOrder = () => {
    // In a real app, this would use the Share API to share the order details
    console.log('Sharing order:', orderNumber);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.successIconContainer}>
          <IconSymbol name="checkmark.circle.fill" size={80} color="#4CAF50" />
        </ThemedView>
        
        <ThemedText type="title" style={styles.title}>Order Confirmed!</ThemedText>
        
        <ThemedText style={styles.message}>
          Thank you for your order. We've received your purchase request and will process it shortly.
        </ThemedText>
        
        <ThemedView style={styles.orderInfoContainer}>
          <ThemedView style={styles.orderInfoRow}>
            <ThemedText style={styles.orderInfoLabel}>Order Number:</ThemedText>
            <ThemedText style={styles.orderInfoValue}>{orderNumber}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.orderInfoRow}>
            <ThemedText style={styles.orderInfoLabel}>Order Date:</ThemedText>
            <ThemedText style={styles.orderInfoValue}>{orderDate}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.orderInfoRow}>
            <ThemedText style={styles.orderInfoLabel}>Estimated Delivery:</ThemedText>
            <ThemedText style={styles.orderInfoValue}>{estimatedDeliveryDate}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.orderInfoRow}>
            <ThemedText style={styles.orderInfoLabel}>Payment Method:</ThemedText>
            <ThemedText style={styles.orderInfoValue}>Mobile Money</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.orderInfoRow}>
            <ThemedText style={styles.orderInfoLabel}>Payment Status:</ThemedText>
            <ThemedView style={styles.paymentStatusContainer}>
              <ThemedText style={styles.paymentStatusText}>Pending</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.paymentInstructionsContainer}>
          <ThemedText type="subtitle" style={styles.paymentInstructionsTitle}>
            Payment Instructions
          </ThemedText>
          
          <ThemedText style={styles.paymentInstructionsText}>
            Please complete your payment using the following instructions:
          </ThemedText>
          
          <ThemedView style={styles.paymentSteps}>
            <ThemedView style={styles.paymentStep}>
              <ThemedView style={styles.paymentStepNumber}>
                <ThemedText style={styles.paymentStepNumberText}>1</ThemedText>
              </ThemedView>
              <ThemedText style={styles.paymentStepText}>
                Dial *144# on your mobile phone
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.paymentStep}>
              <ThemedView style={styles.paymentStepNumber}>
                <ThemedText style={styles.paymentStepNumberText}>2</ThemedText>
              </ThemedView>
              <ThemedText style={styles.paymentStepText}>
                Select "Pay for Services" option
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.paymentStep}>
              <ThemedView style={styles.paymentStepNumber}>
                <ThemedText style={styles.paymentStepNumberText}>3</ThemedText>
              </ThemedView>
              <ThemedText style={styles.paymentStepText}>
                Enter merchant code: 123456
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.paymentStep}>
              <ThemedView style={styles.paymentStepNumber}>
                <ThemedText style={styles.paymentStepNumberText}>4</ThemedText>
              </ThemedView>
              <ThemedText style={styles.paymentStepText}>
                Enter reference number: {orderNumber}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.paymentStep}>
              <ThemedView style={styles.paymentStepNumber}>
                <ThemedText style={styles.paymentStepNumberText}>5</ThemedText>
              </ThemedView>
              <ThemedText style={styles.paymentStepText}>
                Confirm payment with your PIN
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.paymentNote}>
            Your order will be processed once payment is confirmed. You will receive an SMS confirmation.
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={navigateToOrders}
          >
            <IconSymbol name="list.bullet" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText}>View My Orders</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={navigateToMarketplace}
          >
            <IconSymbol name="bag" size={20} color="#0a7ea4" />
            <ThemedText style={styles.secondaryButtonText}>Continue Shopping</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareOrder}
          >
            <IconSymbol name="square.and.arrow.up" size={20} color="#757575" />
            <ThemedText style={styles.shareButtonText}>Share Order Details</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#757575',
    lineHeight: 22,
  },
  orderInfoContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfoLabel: {
    color: '#757575',
  },
  orderInfoValue: {
    fontWeight: '500',
  },
  paymentStatusContainer: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentStatusText: {
    color: '#FFA000',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentInstructionsContainer: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  paymentInstructionsTitle: {
    marginBottom: 12,
    color: '#2E7D32',
  },
  paymentInstructionsText: {
    marginBottom: 16,
    color: '#2E7D32',
  },
  paymentSteps: {
    marginBottom: 16,
  },
  paymentStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentStepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentStepText: {
    flex: 1,
    color: '#2E7D32',
  },
  paymentNote: {
    fontStyle: 'italic',
    color: '#2E7D32',
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  shareButtonText: {
    color: '#757575',
    marginLeft: 8,
  },
});
