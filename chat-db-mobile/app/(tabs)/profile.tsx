import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('currentUser');
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#06070a', '#0b0f14']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {currentUser ? currentUser[0].toUpperCase() : 'M'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser || 'Utilisateur'}</Text>
          <Text style={styles.userStatus}>En ligne</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemPrimary]}
            onPress={() => router.push('/settings/edit-profile')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person" size={24} color="#0ea5ff" />
            </View>
            <Text style={[styles.menuText, styles.menuTextPrimary]}>✏️ Modifier le profil</Text>
            <Ionicons name="chevron-forward" size={20} color="#0ea5ff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/test-notifications')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="flask" size={24} color="#ff6b6b" />
            </View>
            <Text style={styles.menuText}>🧪 Test Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/notifications')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications" size={24} color="#0ea5ff" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/theme')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="moon" size={24} color="#0ea5ff" />
            </View>
            <Text style={styles.menuText}>Thème sombre</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/privacy')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="lock-closed" size={24} color="#0ea5ff" />
            </View>
            <Text style={styles.menuText}>Confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings/help')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="help-circle" size={24} color="#0ea5ff" />
            </View>
            <Text style={styles.menuText}>Aide</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#ff6b6b', '#ee5a52']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(8, 200, 255, 0.3)',
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#0ea5ff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eaf6ff',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#2dd4bf',
  },
  menuContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  menuItemPrimary: {
    backgroundColor: 'rgba(14, 165, 255, 0.15)',
    borderColor: 'rgba(14, 165, 255, 0.3)',
    borderWidth: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#eaf6ff',
  },
  menuTextPrimary: {
    fontWeight: '600',
    color: '#0ea5ff',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 20,
  },
});
