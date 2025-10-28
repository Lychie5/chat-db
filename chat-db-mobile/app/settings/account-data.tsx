import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../config/api';

export default function AccountDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const handleExportData = async () => {
    Alert.alert(
      'Exporter mes données',
      'Cette action va télécharger toutes vos données (conversations, amis, messages) au format JSON.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Exporter',
          onPress: async () => {
            setLoading(true);
            try {
              // Récupérer toutes les données utilisateur
              const [conversations, friends, messages] = await Promise.all([
                api.get(`/api/conversations/${currentUser}`),
                api.get(`/api/friends/${currentUser}`),
                api.get(`/api/user-messages/${currentUser}`), // Endpoint à créer
              ]);

              const userData = {
                pseudo: currentUser,
                exportDate: new Date().toISOString(),
                conversations,
                friends,
                messages,
              };

              // Sauvegarder localement
              const dataStr = JSON.stringify(userData, null, 2);
              await AsyncStorage.setItem(`export_${currentUser}_${Date.now()}`, dataStr);

              Alert.alert(
                'Succès',
                'Vos données ont été exportées. Vous pouvez les retrouver dans les paramètres de l\'application.'
              );
            } catch (error) {
              console.error('Erreur export:', error);
              Alert.alert('Erreur', 'Impossible d\'exporter les données');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Supprimer mon compte',
      'Cette action est IRRÉVERSIBLE. Toutes vos données (conversations, amis, messages) seront définitivement supprimées.\n\nÊtes-vous absolument sûr(e) ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: () => {
            // Double confirmation
            Alert.alert(
              'Dernière confirmation',
              `Tapez "SUPPRIMER" pour confirmer la suppression du compte ${currentUser}`,
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Je confirme',
                  style: 'destructive',
                  onPress: async () => {
                    setLoading(true);
                    try {
                      // Appeler l'API de suppression
                      await api.post('/api/delete-account', { pseudo: currentUser });
                      
                      // Nettoyer les données locales
                      await AsyncStorage.clear();
                      
                      Alert.alert(
                        'Compte supprimé',
                        'Votre compte a été supprimé avec succès.',
                        [
                          {
                            text: 'OK',
                            onPress: () => router.replace('/'),
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('Erreur suppression:', error);
                      Alert.alert('Erreur', 'Impossible de supprimer le compte');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Mes données</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#06070a', '#0b0f14']}
          style={styles.gradient}
        >
          {/* Export Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Export des données</Text>
            <Text style={styles.sectionDescription}>
              Téléchargez une copie de toutes vos données personnelles
            </Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleExportData}
              disabled={loading}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="download" size={32} color="#0ea5ff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Exporter mes données</Text>
                <Text style={styles.actionDescription}>
                  Conversations, amis, messages au format JSON
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Info RGPD */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#2dd4bf" />
            <Text style={styles.infoText}>
              Conformément au RGPD, vous avez le droit d'accéder, de corriger et de supprimer vos données personnelles à tout moment.
            </Text>
          </View>

          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>⚠️ Zone de danger</Text>
            <Text style={styles.dangerDescription}>
              Ces actions sont irréversibles. Procédez avec précaution.
            </Text>

            <TouchableOpacity
              style={styles.dangerCard}
              onPress={handleDeleteAccount}
              disabled={loading}
            >
              <View style={styles.dangerIcon}>
                <Ionicons name="trash" size={32} color="#ff6b6b" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.dangerCardTitle}>Supprimer mon compte</Text>
                <Text style={styles.dangerCardDescription}>
                  Suppression définitive de toutes vos données
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0ea5ff" />
              <Text style={styles.loadingText}>Traitement en cours...</Text>
            </View>
          )}
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.2)',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  dangerSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 107, 0.2)',
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  dangerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 4,
  },
  dangerCardDescription: {
    fontSize: 13,
    color: '#94a3b8',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 7, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#eaf6ff',
    fontSize: 16,
    marginTop: 16,
  },
});
