import { Stack } from 'expo-router';

export default function ForumLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Forum Communautaire"
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: false,
          title: "Catégories"
        }}
      />
      <Stack.Screen
        name="category"
        options={{
          headerShown: false,
          title: "Catégorie"
        }}
      />
      <Stack.Screen
        name="topic"
        options={{
          headerShown: false,
          title: "Sujet"
        }}
      />
      <Stack.Screen
        name="create-topic"
        options={{
          headerShown: false,
          title: "Nouveau Sujet"
        }}
      />
      <Stack.Screen
        name="create-post"
        options={{
          headerShown: false,
          title: "Nouvelle Réponse"
        }}
      />
      <Stack.Screen
        name="user-profile"
        options={{
          headerShown: false,
          title: "Profil Utilisateur"
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
          title: "Recherche"
        }}
      />
      <Stack.Screen
        name="my-topics"
        options={{
          headerShown: false,
          title: "Mes Sujets"
        }}
      />
      <Stack.Screen
        name="my-subscriptions"
        options={{
          headerShown: false,
          title: "Mes Abonnements"
        }}
      />
      <Stack.Screen
        name="regional"
        options={{
          headerShown: false,
          title: "Forums Régionaux"
        }}
      />
      <Stack.Screen
        name="best-practices"
        options={{
          headerShown: false,
          title: "Bonnes Pratiques"
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          headerShown: false,
          title: "Événements et Formations"
        }}
      />
    </Stack>
  );
}
