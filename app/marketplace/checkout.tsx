import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useOffline } from '@/context/OfflineContext';
import {
  sampleCart,
  marketplaceListings,
  CartItem,
  MarketplaceListing,
  DeliveryOption
} from '@/data/marketplace';

// Form section component
const FormSection = ({ title, children }) => (
  <ThemedView style={styles.formSection}>
    <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
    {children}
  </ThemedView>
);

// Form input component
const FormInput = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default', required = false }) => (
  <ThemedView style={styles.formGroup}>
    <ThemedView style={styles.labelContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {required && <ThemedText style={styles.requiredIndicator}>*</ThemedText>}
    </ThemedView>
    <TextInput
      style={[
        styles.input,
        multiline && styles.multilineInput
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </ThemedView>
);

// Order summary item component
const OrderSummaryItem = ({ item, listing }) => (
  <ThemedView style={styles.summaryItem}>
    <ThemedView style={styles.summaryItemDetails}>
      <ThemedText numberOfLines={1} style={styles.summaryItemTitle}>
        {listing.title}
      </ThemedText>
      <ThemedText style={styles.summaryItemQuantity}>
        {item.quantity} x {listing.price.amount.toLocaleString()} {listing.price.currency}
      </ThemedText>
    </ThemedView>
    <ThemedText style={styles.summaryItemPrice}>
      {(item.quantity * listing.price.amount).toLocaleString()} {listing.price.currency}
    </ThemedText>
  </ThemedView>
);

export default function CheckoutScreen() {
  const router = useRouter();
  const { isOnline } = useOffline();

  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemDetails, setCartItemDetails] = useState<{
    item: CartItem;
    listing: MarketplaceListing;
  }[]>([]);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryOption>('local_delivery');
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const calculateSubtotal = () => {
    return cartItemDetails.reduce((total, { item, listing }) => {
      return total + (item.quantity * listing.price.amount);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    // In a real app, this would calculate based on distance, weight, etc.
    return deliveryMethod === 'pickup_only' ? 0 : 2000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!region.trim()) {
      newErrors.region = 'Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!isOnline) {
      Alert.alert(
        'Offline Mode',
        'You need to be online to place an order. Please try again when you have an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors in the form before placing your order.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    // In a real app, this would submit the order to an API
    setTimeout(() => {
      setIsSubmitting(false);

      // Navigate to order confirmation
      router.push('/marketplace/order-confirmation');
    }, 2000);
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <IconSymbol name="chevron.left" size={20} color="#0a7ea4" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type="subtitle" style={styles.headerTitle}>Checkout</ThemedText>

        <ThemedView style={{ width: 40 }} />
      </ThemedView>

      {!isOnline && (
        <ThemedView style={styles.offlineBanner}>
          <IconSymbol name="wifi.slash" size={16} color="white" />
          <ThemedText style={styles.offlineBannerText}>
            You're offline. You need to be online to complete your purchase.
          </ThemedText>
        </ThemedView>
      )}

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <ThemedText style={styles.loadingText}>Loading checkout...</ThemedText>
        </ThemedView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FormSection title="Delivery Address">
            <FormInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              required
            />
            {errors.fullName && <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>}

            <FormInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              required
            />
            {errors.phoneNumber && <ThemedText style={styles.errorText}>{errors.phoneNumber}</ThemedText>}

            <FormInput
              label="Address Line 1"
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="Street address, house number"
              required
            />
            {errors.addressLine1 && <ThemedText style={styles.errorText}>{errors.addressLine1}</ThemedText>}

            <FormInput
              label="Address Line 2 (Optional)"
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Apartment, suite, unit, building, etc."
            />

            <FormInput
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Enter city"
              required
            />
            {errors.city && <ThemedText style={styles.errorText}>{errors.city}</ThemedText>}

            <FormInput
              label="Region"
              value={region}
              onChangeText={setRegion}
              placeholder="Enter region"
              required
            />
            {errors.region && <ThemedText style={styles.errorText}>{errors.region}</ThemedText>}

            <FormInput
              label="Special Instructions (Optional)"
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Any special delivery instructions"
              multiline
            />
          </FormSection>

          <FormSection title="Delivery Method">
            <ThemedView style={styles.customPickerContainer}>
              <TouchableOpacity
                style={[styles.customPickerOption, deliveryMethod === 'local_delivery' && styles.customPickerOptionSelected]}
                onPress={() => setDeliveryMethod('local_delivery')}
              >
                <ThemedText style={[styles.customPickerText, deliveryMethod === 'local_delivery' && styles.customPickerTextSelected]}>
                  Local Delivery
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customPickerOption, deliveryMethod === 'pickup_only' && styles.customPickerOptionSelected]}
                onPress={() => setDeliveryMethod('pickup_only')}
              >
                <ThemedText style={[styles.customPickerText, deliveryMethod === 'pickup_only' && styles.customPickerTextSelected]}>
                  Pickup Only
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customPickerOption, deliveryMethod === 'shipping' && styles.customPickerOptionSelected]}
                onPress={() => setDeliveryMethod('shipping')}
              >
                <ThemedText style={[styles.customPickerText, deliveryMethod === 'shipping' && styles.customPickerTextSelected]}>
                  Shipping
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {deliveryMethod === 'pickup_only' && (
              <ThemedView style={styles.infoBox}>
                <IconSymbol name="info.circle" size={16} color="#0a7ea4" />
                <ThemedText style={styles.infoText}>
                  You'll need to pick up your order from the seller's location. Contact details will be provided after your order is confirmed.
                </ThemedText>
              </ThemedView>
            )}
          </FormSection>

          <FormSection title="Payment Method">
            <ThemedView style={styles.customPickerContainer}>
              <TouchableOpacity
                style={[styles.customPickerOption, paymentMethod === 'mobile_money' && styles.customPickerOptionSelected]}
                onPress={() => setPaymentMethod('mobile_money')}
              >
                <ThemedText style={[styles.customPickerText, paymentMethod === 'mobile_money' && styles.customPickerTextSelected]}>
                  Mobile Money
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customPickerOption, paymentMethod === 'cash_on_delivery' && styles.customPickerOptionSelected]}
                onPress={() => setPaymentMethod('cash_on_delivery')}
              >
                <ThemedText style={[styles.customPickerText, paymentMethod === 'cash_on_delivery' && styles.customPickerTextSelected]}>
                  Cash on Delivery
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customPickerOption, paymentMethod === 'bank_transfer' && styles.customPickerOptionSelected]}
                onPress={() => setPaymentMethod('bank_transfer')}
              >
                <ThemedText style={[styles.customPickerText, paymentMethod === 'bank_transfer' && styles.customPickerTextSelected]}>
                  Bank Transfer
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {paymentMethod === 'mobile_money' && (
              <ThemedView style={styles.infoBox}>
                <IconSymbol name="info.circle" size={16} color="#0a7ea4" />
                <ThemedText style={styles.infoText}>
                  You'll receive payment instructions via SMS after placing your order.
                </ThemedText>
              </ThemedView>
            )}
          </FormSection>

          <FormSection title="Order Summary">
            {cartItemDetails.map(({ item, listing }) => (
              <OrderSummaryItem
                key={item.id}
                item={item}
                listing={listing}
              />
            ))}

            <ThemedView style={styles.divider} />

            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {calculateSubtotal().toLocaleString()} XOF
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {calculateDeliveryFee().toLocaleString()} XOF
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.summaryRow}>
              <ThemedText type="defaultSemiBold" style={styles.totalLabel}>Total</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalValue}>
                {calculateTotal().toLocaleString()} XOF
              </ThemedText>
            </ThemedView>
          </FormSection>

          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <IconSymbol name="bag.fill" size={20} color="white" />
                <ThemedText style={styles.placeOrderButtonText}>Place Order</ThemedText>
              </>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
  },
  requiredIndicator: {
    color: '#F44336',
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: -8,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  customPickerContainer: {
    marginBottom: 16,
  },
  customPickerOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  customPickerOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0a7ea4',
  },
  customPickerText: {
    fontSize: 16,
  },
  customPickerTextSelected: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0a7ea4',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItemDetails: {
    flex: 1,
    marginRight: 8,
  },
  summaryItemTitle: {
    marginBottom: 4,
  },
  summaryItemQuantity: {
    fontSize: 14,
    color: '#757575',
  },
  summaryItemPrice: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
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
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
