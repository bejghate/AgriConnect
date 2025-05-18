import { Stack } from 'expo-router';

export default function FinancialServicesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Services Financiers"
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          headerShown: false,
          title: "Produits Financiers"
        }}
      />
      <Stack.Screen
        name="product-details"
        options={{
          headerShown: false,
          title: "Détails du Produit"
        }}
      />
      <Stack.Screen
        name="apply"
        options={{
          headerShown: false,
          title: "Demande de Financement"
        }}
      />
      <Stack.Screen
        name="applications"
        options={{
          headerShown: false,
          title: "Mes Demandes"
        }}
      />
      <Stack.Screen
        name="application-details"
        options={{
          headerShown: false,
          title: "Détails de la Demande"
        }}
      />
      <Stack.Screen
        name="repayments"
        options={{
          headerShown: false,
          title: "Mes Remboursements"
        }}
      />
      <Stack.Screen
        name="education"
        options={{
          headerShown: false,
          title: "Éducation Financière"
        }}
      />
      <Stack.Screen
        name="calculators"
        options={{
          headerShown: false,
          title: "Calculateurs Financiers"
        }}
      />
      <Stack.Screen
        name="loan-calculator"
        options={{
          headerShown: false,
          title: "Calculateur de Prêt"
        }}
      />
      <Stack.Screen
        name="insurance-calculator"
        options={{
          headerShown: false,
          title: "Calculateur d'Assurance"
        }}
      />
      <Stack.Screen
        name="savings-calculator"
        options={{
          headerShown: false,
          title: "Calculateur d'Épargne"
        }}
      />
    </Stack>
  );
}
