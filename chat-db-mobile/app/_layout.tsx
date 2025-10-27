import { Stack } from 'expo-router';

export default function RootLayout() {
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
