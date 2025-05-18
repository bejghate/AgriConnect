import { Stack } from 'expo-router';

export default function EncyclopediaLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="subcategories"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="items"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="breed-detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="variety-detail"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="favorites"
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
        name="updates"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="symptom-diagnostic"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
