import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import LogBoxPlugin from '@/plugins/LogBoxPlugin';

export default function Index() {
  // Initialiser le plugin LogBox pour supprimer les avertissements
  useEffect(() => {
    LogBoxPlugin.init();
  }, []);

  // Redirect to the home screen
  return <Redirect href="/home" />;
}
