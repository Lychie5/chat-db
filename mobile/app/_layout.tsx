import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Ignorer les avertissements non critiques
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state',
      'VirtualizedLists should never be nested',
      'Setting a timer',
      'Require cycle',
    ]);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="settings/notifications" />
      <Stack.Screen name="settings/theme" />
      <Stack.Screen name="settings/privacy" />
      <Stack.Screen name="settings/help" />
    </Stack>
  );
}
