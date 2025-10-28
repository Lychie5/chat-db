import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BlockedUser {
  pseudo: string;
  blockedAt: string;
}

export default function BlockedUsersScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadBlockedUsers();
    }
  }, [currentUser]);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const loadBlockedUsers = async () => {
    try {
      const stored = await AsyncStorage.getItem(`blockedUsers_${currentUser}`);
      if (stored) {
        setBlockedUsers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs bloqués:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!searchText.trim()) {
      Alert.alert('Erreur', 'Entrez un pseudo');
      return;
    }

    if (searchText.toLowerCase() === currentUser.toLowerCase()) {
      Alert.alert('Erreur', 'Vous ne pouvez pas vous bloquer vous-même');
      return;
    }

    // Vérifier si déjà bloqué
    if (blockedUsers.some(u => u.pseudo.toLowerCase() === searchText.toLowerCase())) {
      Alert.alert('Info', 'Cet utilisateur est déjà bloqué');
      return;
    }

    const newBlocked: BlockedUser = {
      pseudo: searchText.trim(),
      blockedAt: new Date().toISOString(),
    };

    const updated = [...blockedUsers, newBlocked];
    setBlockedUsers(updated);
    
    try {
      await AsyncStorage.setItem(`blockedUsers_${currentUser}`, JSON.stringify(updated));
      Alert.alert('Succès', `${searchText} a été bloqué`);
      setSearchText('');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de bloquer cet utilisateur');
    }
  };

  const handleUnblockUser = async (pseudo: string) => {
    Alert.alert(
      'Débloquer',
      `Voulez-vous débloquer ${pseudo} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Débloquer',
          onPress: async () => {
            const updated = blockedUsers.filter(u => u.pseudo !== pseudo);
            setBlockedUsers(updated);
            try {
              await AsyncStorage.setItem(`blockedUsers_${currentUser}`, JSON.stringify(updated));
              Alert.alert('Succès', `${pseudo} a été débloqué`);
            } catch (error) {
              console.error('Erreur sauvegarde:', error);
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.pseudo[0].toUpperCase()}</Text>
      </View>
      <View style={styles.userContent}>
        <Text style={styles.userName}>{item.pseudo}</Text>
        <Text style={styles.blockedDate}>
          Bloqué le {new Date(item.blockedAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblockUser(item.pseudo)}
      >
        <Ionicons name="checkmark-circle" size={24} color="#2dd4bf" />
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Utilisateurs bloqués</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <LinearGradient
        colors={['#06070a', '#0b0f14']}
        style={styles.gradient}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Bloquer un utilisateur..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            style={styles.blockButton}
            onPress={handleBlockUser}
          >
            <Ionicons name="ban" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {blockedUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>Aucun utilisateur bloqué</Text>
            <Text style={styles.emptySubtext}>
              Les utilisateurs bloqués ne pourront pas vous contacter
            </Text>
          </View>
        ) : (
          <FlatList
            data={blockedUsers}
            renderItem={renderBlockedUser}
            keyExtractor={(item) => item.pseudo}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#94a3b8" />
          <Text style={styles.infoText}>
            Les utilisateurs bloqués ne pourront pas vous envoyer de messages, de demandes d'ami ou voir votre statut en ligne.
          </Text>
        </View>
      </LinearGradient>
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
  gradient: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#eaf6ff',
    fontSize: 15,
    paddingVertical: 12,
  },
  blockButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  userContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 4,
  },
  blockedDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  unblockButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#eaf6ff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
