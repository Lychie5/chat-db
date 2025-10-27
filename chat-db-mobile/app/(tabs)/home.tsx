import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '../../config/api';

interface Conversation {
  id: number;
  user1: string;
  user2: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ConversationDisplay {
  id: number;
  username: string;
  lastMessage: string;
  time: string;
}

export default function HomeScreen() {
  const [conversations, setConversations] = useState<ConversationDisplay[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  // Recharger les conversations quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      const data: Conversation[] = await api.get(`/api/conversations/${currentUser}`);
      
      // Transformer les données pour l'affichage
      const displayData: ConversationDisplay[] = data.map(conv => {
        // L'autre utilisateur dans la conversation
        const otherUser = conv.user1 === currentUser ? conv.user2 : conv.user1;
        
        return {
          id: conv.id,
          username: otherUser,
          lastMessage: conv.lastMessage || 'Pas de messages',
          time: conv.lastMessageTime 
            ? new Date(conv.lastMessageTime).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : '',
        };
      });
      
      setConversations(displayData);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // En cas d'erreur, afficher vide
      setConversations([]);
    }
  };

  const openChat = (conversation: ConversationDisplay) => {
    router.push({
      pathname: '/chat/[id]',
      params: { 
        id: conversation.id.toString(),
        username: conversation.username,
      },
    });
  };

  const renderConversation = ({ item }: { item: ConversationDisplay }) => (
    <TouchableOpacity 
      style={styles.conversationItem} 
      activeOpacity={0.7}
      onPress={() => openChat(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.username[0]}</Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#06070a', '#0b0f14']}
        style={styles.gradient}
      >
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <Text style={styles.emptySubtext}>
              Commencez par ajouter des amis !
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
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
  listContent: {
    padding: 16,
  },
  conversationItem: {
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
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  lastMessage: {
    fontSize: 14,
    color: '#94a3b8',
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
