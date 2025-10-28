import React, { useState } from 'react';
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

export default function PrivacyScreen() {
  const router = useRouter();
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState('everyone');

  const handleBlockedUsers = () => {
    router.push('/settings/blocked-users');
  };

  const handleDataDownload = () => {
    router.push('/settings/account-data');
  };

  const handleDeleteAccount = () => {
    router.push('/settings/account-data');
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
        <Text style={styles.headerTitle}>Confidentialité</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#06070a', '#0b0f14']}
          style={styles.gradient}
        >
          {/* Statut en ligne */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Présence</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="radio" size={20} color="#0ea5ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Statut en ligne</Text>
                  <Text style={styles.settingSubtext}>
                    Montrer quand je suis en ligne
                  </Text>
                </View>
              </View>
              <Switch
                value={onlineStatus}
                onValueChange={setOnlineStatus}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={onlineStatus ? '#0ea5ff' : '#94a3b8'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={20} color="#0ea5ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Dernière connexion</Text>
                  <Text style={styles.settingSubtext}>
                    Afficher l'heure de dernière activité
                  </Text>
                </View>
              </View>
              <Switch
                value={lastSeen}
                onValueChange={setLastSeen}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={lastSeen ? '#0ea5ff' : '#94a3b8'}
              />
            </View>
          </View>

          {/* Messagerie */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Messagerie</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="checkmark-done" size={20} color="#0ea5ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Accusés de lecture</Text>
                  <Text style={styles.settingSubtext}>
                    Notifier quand je lis les messages
                  </Text>
                </View>
              </View>
              <Switch
                value={readReceipts}
                onValueChange={setReadReceipts}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={readReceipts ? '#0ea5ff' : '#94a3b8'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="create" size={20} color="#0ea5ff" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>Indicateur de saisie</Text>
                  <Text style={styles.settingSubtext}>
                    Montrer quand je tape un message
                  </Text>
                </View>
              </View>
              <Switch
                value={typingIndicator}
                onValueChange={setTypingIndicator}
                trackColor={{ false: '#334155', true: '#0ea5ff80' }}
                thumbColor={typingIndicator ? '#0ea5ff' : '#94a3b8'}
              />
            </View>
          </View>

          {/* Photo de profil */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo de profil</Text>
            
            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons name="people" size={20} color="#0ea5ff" />
                <Text style={styles.optionText}>Qui peut voir ma photo</Text>
              </View>
              <View style={styles.optionRight}>
                <Text style={styles.optionValue}>
                  {profilePhoto === 'everyone' ? 'Tout le monde' : 
                   profilePhoto === 'friends' ? 'Mes amis' : 'Personne'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Utilisateurs bloqués */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestion</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleBlockedUsers}
            >
              <Ionicons name="ban" size={20} color="#0ea5ff" />
              <Text style={styles.actionText}>Utilisateurs bloqués</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Données personnelles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes données</Text>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleDataDownload}
            >
              <Ionicons name="download" size={20} color="#0ea5ff" />
              <Text style={styles.actionText}>Télécharger mes données</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text style={[styles.actionText, styles.dangerText]}>
                Supprimer mon compte
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#94a3b8" />
            <Text style={styles.infoText}>
              Vos données sont chiffrées et protégées. Vous gardez le contrôle total sur vos informations personnelles.
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#eaf6ff',
    fontWeight: '500',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: '#94a3b8',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#eaf6ff',
    fontWeight: '500',
  },
  dangerItem: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  dangerText: {
    color: '#ef4444',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
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
