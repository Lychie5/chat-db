// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demande les permissions pour les notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('❌ Permission de notification refusée');
      return false;
    }
    
    console.log('✅ Permission de notification accordée');
    return true;
  } catch (error) {
    console.error('Erreur permission notifications:', error);
    return false;
  }
}

/**
 * Affiche une notification locale pour un nouveau message
 */
export async function showMessageNotification(
  senderName: string,
  messageText: string,
  conversationId: number
) {
  try {
    console.log('🔔 showMessageNotification called:', { senderName, messageText, conversationId });
    
    // Vérifier les permissions
    const { status } = await Notifications.getPermissionsAsync();
    console.log('📋 Notification permission status:', status);
    
    if (status !== 'granted') {
      console.warn('⚠️ Permissions not granted, requesting...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.error('❌ Notification permissions denied');
        return;
      }
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${senderName}`,
        body: messageText,
        sound: true,
        data: {
          type: 'message',
          conversationId,
          sender: senderName,
        },
      },
      trigger: null, // Afficher immédiatement
    });
    
    console.log('✅ Notification scheduled with ID:', notificationId);
  } catch (error) {
    console.error('❌ Erreur affichage notification:', error);
  }
}

/**
 * Affiche une notification pour une nouvelle demande d'ami
 */
export async function showFriendRequestNotification(
  senderName: string,
  requestId: number
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👋 Nouvelle demande d\'ami',
        body: `${senderName} veut devenir votre ami`,
        sound: true,
        data: {
          type: 'friend_request',
          requestId,
          sender: senderName,
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Erreur notification demande ami:', error);
  }
}

/**
 * Affiche une notification pour une demande de conversation
 */
export async function showConversationRequestNotification(
  senderName: string,
  requestId: number
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💬 Nouvelle demande de conversation',
        body: `${senderName} veut démarrer une conversation`,
        sound: true,
        data: {
          type: 'conversation_request',
          requestId,
          sender: senderName,
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Erreur notification conversation:', error);
  }
}

/**
 * Configure les listeners pour les notifications
 */
export function setupNotificationListeners(
  onNotificationPress: (data: any) => void
) {
  // Quand l'utilisateur clique sur une notification
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      onNotificationPress(data);
    }
  );

  return () => {
    subscription.remove();
  };
}
