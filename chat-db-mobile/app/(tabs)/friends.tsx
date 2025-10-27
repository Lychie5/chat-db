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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../config/api';

interface Friend {
  id: number;
  pseudo: string;
  status: string;
}

interface FriendRequest {
  id: number;
  sender: string;
  receiver: string;
  status: string;
}

type TabType = 'friends' | 'received' | 'sent';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (currentUser) {
        loadAllData();
      }
    }, [currentUser])
  );

  const loadAllData = () => {
    loadFriends();
    loadReceivedRequests();
    loadSentRequests();
  };

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const loadFriends = async () => {
    try {
      if (!currentUser) return;
      
      const data = await api.get(`/api/friends/${currentUser}`);
      
      // Vérifier que data est un tableau
      if (!Array.isArray(data)) {
        console.warn('Friends data is not an array:', data);
        setFriends([]);
        return;
      }
      
      // Transformer les données pour avoir le bon format
      const friendsList = data.map((friend: any) => ({
        id: friend.id,
        pseudo: friend.sender === currentUser ? friend.receiver : friend.sender,
        status: 'Hors ligne', // TODO: Implémenter le statut en ligne avec Socket.IO
      }));
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    }
  };

  const loadReceivedRequests = async () => {
    try {
      if (!currentUser) return;
      const data = await api.get(`/api/friend-requests/${currentUser}`);
      
      // Vérifier que data est un tableau
      if (!Array.isArray(data)) {
        console.warn('Received requests data is not an array:', data);
        setReceivedRequests([]);
        return;
      }
      
      // Filtrer uniquement les demandes reçues (où currentUser est le receiver)
      const received = data.filter((r: FriendRequest) => 
        r.receiver.toLowerCase() === currentUser.toLowerCase() && 
        r.status === 'pending'
      );
      setReceivedRequests(received);
    } catch (error) {
      console.error('Error loading received requests:', error);
      setReceivedRequests([]);
    }
  };

  const loadSentRequests = async () => {
    try {
      if (!currentUser) return;
      
      // Utiliser l'endpoint existant qui renvoie toutes les demandes
      const data = await api.get(`/api/friend-requests/${currentUser}`);
      
      // Vérifier que data est un tableau
      if (!Array.isArray(data)) {
        console.warn('Sent requests data is not an array:', data);
        setSentRequests([]);
        return;
      }
      
      // Filtrer uniquement les demandes envoyées (où currentUser est le sender)
      const sent = data.filter((r: any) => 
        r.sender.toLowerCase() === currentUser.toLowerCase() && 
        r.status === 'pending'
      );
      setSentRequests(sent);
    } catch (error) {
      console.error('Error loading sent requests:', error);
      setSentRequests([]);
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
        loadAllData(); // Recharger toutes les données
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

  const handleAcceptRequest = async (requestId: number, senderName: string) => {
    try {
      await api.post(`/api/friend-accept/${requestId}`, {});
      Alert.alert('Succès', `Vous êtes maintenant ami avec ${senderName}`);
      loadAllData();
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Erreur', "Impossible d'accepter la demande");
    }
  };

  const handleDeclineRequest = async (requestId: number) => {
    try {
      await api.post(`/api/friend-decline/${requestId}`, {});
      Alert.alert('Demande refusée');
      loadAllData();
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Erreur', "Impossible de refuser la demande");
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    Alert.alert(
      'Annuler la demande',
      'Voulez-vous vraiment annuler cette demande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          onPress: async () => {
            try {
              await api.post(`/api/friend-decline/${requestId}`, {});
              loadAllData();
            } catch (error) {
              console.error('Error canceling request:', error);
              Alert.alert('Erreur', "Impossible d'annuler la demande");
            }
          },
        },
      ]
    );
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
        <Text style={styles.avatarText}>{item.pseudo[0].toUpperCase()}</Text>
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

  const renderReceivedRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.sender[0].toUpperCase()}</Text>
      </View>
      <View style={styles.requestContent}>
        <Text style={styles.requestName}>{item.sender}</Text>
        <Text style={styles.requestLabel}>vous a envoyé une demande</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id, item.sender)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.receiver[0].toUpperCase()}</Text>
      </View>
      <View style={styles.requestContent}>
        <Text style={styles.requestName}>{item.receiver}</Text>
        <Text style={styles.requestLabel}>En attente de réponse...</Text>
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelRequest(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#94a3b8" />
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
        {/* Search Bar */}
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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'friends' ? '#0ea5ff' : '#94a3b8'} 
            />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Mes amis
            </Text>
            {friends.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friends.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <Ionicons 
              name="mail" 
              size={20} 
              color={activeTab === 'received' ? '#0ea5ff' : '#94a3b8'} 
            />
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Reçues
            </Text>
            {receivedRequests.length > 0 && (
              <View style={styles.badgeAlert}>
                <Text style={styles.badgeText}>{receivedRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Ionicons 
              name="paper-plane" 
              size={20} 
              color={activeTab === 'sent' ? '#0ea5ff' : '#94a3b8'} 
            />
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Envoyées
            </Text>
            {sentRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sentRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'friends' && (
          friends.length === 0 ? (
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
          )
        )}

        {activeTab === 'received' && (
          receivedRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyText}>Aucune demande</Text>
              <Text style={styles.emptySubtext}>
                Vous n'avez pas de demandes d'ami en attente
              </Text>
            </View>
          ) : (
            <FlatList
              data={receivedRequests}
              renderItem={renderReceivedRequest}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )
        )}

        {activeTab === 'sent' && (
          sentRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paper-plane-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyText}>Aucune demande envoyée</Text>
              <Text style={styles.emptySubtext}>
                Vos demandes d'ami en attente apparaîtront ici
              </Text>
            </View>
          ) : (
            <FlatList
              data={sentRequests}
              renderItem={renderSentRequest}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
            />
          )
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  activeTab: {
    backgroundColor: 'rgba(14, 165, 255, 0.15)',
    borderColor: 'rgba(14, 165, 255, 0.3)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  activeTabText: {
    color: '#0ea5ff',
  },
  badge: {
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeAlert: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  requestContent: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 2,
  },
  requestLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#2dd4bf',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    padding: 8,
  },
});
