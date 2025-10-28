import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [messageSound, setMessageSound] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [conversationRequests, setConversationRequests] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);

  // Charger les préférences au démarrage
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await AsyncStorage.getItem('notificationPreferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        setPushEnabled(parsed.pushEnabled ?? true);
        setMessageSound(parsed.messageSound ?? true);
        setFriendRequests(parsed.friendRequests ?? true);
        setConversationRequests(parsed.conversationRequests ?? true);
        setVibration(parsed.vibration ?? true);
        setShowPreview(parsed.showPreview ?? true);
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreference = async (key: string, value: boolean) => {
    try {
      const currentPrefs = await AsyncStorage.getItem('notificationPreferences');
      const prefs = currentPrefs ? JSON.parse(currentPrefs) : {};
      prefs[key] = value;
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Erreur sauvegarde préférence:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    }
  };

  const handleTogglePush = async (value: boolean) => {
    setPushEnabled(value);
    await savePreference('pushEnabled', value);
  };

  const handleToggleSound = async (value: boolean) => {
    setMessageSound(value);
    await savePreference('messageSound', value);
  };

  const handleToggleVibration = async (value: boolean) => {
    setVibration(value);
    await savePreference('vibration', value);
  };

  const handleToggleFriendRequests = async (value: boolean) => {
    setFriendRequests(value);
    await savePreference('friendRequests', value);
  };

  const handleToggleConversationRequests = async (value: boolean) => {
    setConversationRequests(value);
    await savePreference('conversationRequests', value);
  };

  const handleTogglePreview = async (value: boolean) => {
    setShowPreview(value);
    await savePreference('showPreview', value);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#eaf6ff' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0b0f14', '#0f1720']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#eaf6ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#06070a', '#0b0f14']}
          style={styles.gradient}
        >
          {/* Notifications Push */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications Push</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color="#0ea5ff" />
                <Text style={styles.settingText}>Activer les notifications</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePush}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={pushEnabled ? '#0ea5ff' : '#94a3b8'}
              />
            </View>
          </View>

          {/* Sons et vibrations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sons et vibrations</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="volume-high" size={20} color="#0ea5ff" />
                <Text style={styles.settingText}>Son des messages</Text>
              </View>
              <Switch
                value={messageSound}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={messageSound ? '#0ea5ff' : '#94a3b8'}
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="phone-portrait" size={20} color="#0ea5ff" />
                <Text style={styles.settingText}>Vibration</Text>
              </View>
              <Switch
                value={vibration}
                onValueChange={handleToggleVibration}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={vibration ? '#0ea5ff' : '#94a3b8'}
                disabled={!pushEnabled}
              />
            </View>
          </View>

          {/* Types de notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Types de notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="person-add" size={20} color="#0ea5ff" />
                <Text style={styles.settingText}>Demandes d'ami</Text>
              </View>
              <Switch
                value={friendRequests}
                onValueChange={handleToggleFriendRequests}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={friendRequests ? '#0ea5ff' : '#94a3b8'}
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="chatbubbles" size={20} color="#0ea5ff" />
                <Text style={styles.settingText}>Demandes de conversation</Text>
              </View>
              <Switch
                value={conversationRequests}
                onValueChange={handleToggleConversationRequests}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={conversationRequests ? '#0ea5ff' : '#94a3b8'}
                disabled={!pushEnabled}
              />
            </View>
          </View>

          {/* Aperçu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Confidentialité</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye" size={20} color="#0ea5ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Aperçu des messages</Text>
                  <Text style={styles.settingSubtext}>
                    Afficher le contenu dans les notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={showPreview}
                onValueChange={handleTogglePreview}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={showPreview ? '#0ea5ff' : '#94a3b8'}
                disabled={!pushEnabled}
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#94a3b8" />
            <Text style={styles.infoText}>
              Les notifications vous permettent de rester informé des nouveaux messages et demandes en temps réel.
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06070a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(8, 200, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eaf6ff',
  },
  scrollView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#eaf6ff',
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 255, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
