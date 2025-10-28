import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { showMessageNotification } from '../../services/notificationService';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

export default function NotificationTestScreen() {
  const router = useRouter();

  const testLocalNotification = async () => {
    try {
      console.log('🧪 Testing local notification...');
      await showMessageNotification('Test User', 'Ceci est un message de test !', 999);
      Alert.alert('✅', 'Notification envoyée ! Vérifie ton écran.');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Erreur', String(error));
    }
  };

  const testDirectNotification = async () => {
    try {
      console.log('🧪 Testing direct notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('⚠️', 'Permissions non accordées !');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Test Direct',
          body: 'Cette notification a été créée directement !',
          sound: true,
        },
        trigger: null,
      });
      
      Alert.alert('✅', 'Notification directe envoyée !');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Erreur', String(error));
    }
  };

  const testDelayedNotification = async () => {
    try {
      console.log('🧪 Testing delayed notification (5 seconds)...');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Test Delayed',
          body: 'Cette notification était programmée pour 5 secondes !',
          sound: true,
        },
        trigger: { type: 'timeInterval', seconds: 5, repeats: false } as any,
      });
      
      Alert.alert('✅', 'Notification programmée ! Attends 5 secondes...');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Erreur', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test des Notifications</Text>
      <Text style={styles.subtitle}>
        ⚠️ Les notifications locales ne fonctionnent pas bien dans Expo Go.
        {'\n'}Pour des notifications complètes, il faut builder un APK.
      </Text>

      <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
        <Text style={styles.buttonText}>📱 Test Service Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testDirectNotification}>
        <Text style={styles.buttonText}>🔔 Test Direct (immédiat)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testDelayedNotification}>
        <Text style={styles.buttonText}>⏰ Test Delayed (5 sec)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.backButton]} 
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📝 Instructions :</Text>
        <Text style={styles.instructionText}>
          1. Clique sur "Test Direct"{'\n'}
          2. Minimise l'app (bouton Home){'\n'}
          3. Si tu vois une notification → ✅ Ça marche !{'\n'}
          4. Sinon → ❌ Expo Go limitation
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#6c63ff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#555',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#2a2a3e',
    borderRadius: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 22,
  },
});
