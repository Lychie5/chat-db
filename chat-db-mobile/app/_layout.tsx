import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { requestNotificationPermissions, setupNotificationListeners } from '../services/notificationService';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Ignorer les avertissements non critiques
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state',
      'VirtualizedLists should never be nested',
      'Setting a timer',
      'Require cycle',
    ]);

    // Demander les permissions de notification
    requestNotificationPermissions();

    // Écouter les clics sur les notifications
    const cleanup = setupNotificationListeners((data) => {
      console.log('📱 Notification cliquée:', data);
      
      // Naviguer selon le type de notification
      if (data.type === 'message' && data.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else if (data.type === 'friend_request') {
        router.push('/(tabs)/friends');
      } else if (data.type === 'conversation_request') {
        router.push('/(tabs)/home');
      }
    });

    return cleanup;
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
      <Stack.Screen name="settings/blocked-users" />
      <Stack.Screen name="settings/account-data" />
      <Stack.Screen name="settings/test-notifications" />
    </Stack>
  );
}
