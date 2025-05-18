import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function FinancialServicesTab() {
  // This tab screen simply redirects to the financial services module
  return <Redirect href="/financial-services" />;
}
