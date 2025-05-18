import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function ForumTab() {
  // This tab screen simply redirects to the forum module
  return <Redirect href="/forum" />;
}
