import { Stack } from 'expo-router';

export default function MarketplaceLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="listing"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="category"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="seller"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="all-products"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="all-services"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-listing"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order-details"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
