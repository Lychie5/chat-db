import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../config/api';

interface Friend {
  id: number;
  pseudo: string;
  status: string;
}

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadFriends();
    }
  }, [currentUser]);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const loadFriends = async () => {
    try {
      if (!currentUser) return;
      
      const data = await api.get(`/api/friends/${currentUser}`);
      
      // Transformer les données pour avoir le bon format
      const friendsList = data.map((friend: any) => ({
        id: friend.id,
        pseudo: friend.sender === currentUser ? friend.receiver : friend.sender,
        status: 'Hors ligne', // TODO: Implémenter le statut en ligne avec Socket.IO
      }));
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      // En cas d'erreur, afficher les données de démonstration
      setFriends([
        { id: 1, pseudo: 'Alice', status: 'En ligne' },
        { id: 2, pseudo: 'Bob', status: 'Hors ligne' },
        { id: 3, pseudo: 'Charlie', status: 'En ligne' },
      ]);
    }
  };

  const handleAddFriend = async () => {
    if (!searchText.trim()) {
      Alert.alert('Erreur', 'Entrez un pseudo');
      return;
    }

    if (searchText.toLowerCase() === currentUser.toLowerCase()) {
      Alert.alert('Erreur', 'Vous ne pouvez pas vous ajouter vous-même');
      return;
    }

    try {
      const response = await api.post('/api/send-friend-request', {
        sender: currentUser,
        receiver: searchText.trim(),
      });

      if (response.ok) {
        Alert.alert('Succès', `Demande d'ami envoyée à ${searchText}`);
        setSearchText('');
        loadFriends(); // Recharger la liste
      }
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      if (error.message.includes('400')) {
        Alert.alert('Erreur', 'Demande déjà existante ou utilisateur introuvable');
      } else {
        Alert.alert('Erreur', "Impossible d'envoyer la demande");
      }
    }
  };

  const handleStartConversation = async (friendName: string) => {
    try {
      // Appeler l'API pour créer ou récupérer la conversation
      const response = await api.post(
        `/api/conversation-between/${currentUser}/${friendName}`,
        {}
      );

      if (response && response.id) {
        // Naviguer vers l'écran de chat
        router.push({
          pathname: '/chat/[id]',
          params: {
            id: response.id.toString(),
            username: friendName,
          },
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la conversation');
    }
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.pseudo[0]}</Text>
      </View>
      <View style={styles.friendContent}>
        <Text style={styles.friendName}>{item.pseudo}</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.status === 'En ligne' ? '#2dd4bf' : '#94a3b8' }
          ]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.messageButton}
        onPress={() => handleStartConversation(item.pseudo)}
      >
        <Ionicons name="chatbubble" size={20} color="#0ea5ff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#06070a', '#0b0f14']}
        style={styles.gradient}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un ami..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddFriend}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>Aucun ami</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des amis pour commencer à discuter !
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
        )}
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
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#eaf6ff',
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: '#0ea5ff',
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0ea5ff',
  },
  friendContent: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageButton: {
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
});
