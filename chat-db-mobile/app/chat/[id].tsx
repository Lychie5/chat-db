import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, API_CONFIG } from '../../config/api';
import io from 'socket.io-client';

interface Message {
  id: number;
  sender: string;
  body: string;
  created_at: string;
}

export default function ChatScreen() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState('');
  const [messageText, setMessageText] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUser();
    loadMessages();
    initSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('currentUser');
    if (user) setCurrentUser(user);
  };

  const loadMessages = async () => {
    try {
      const data = await api.get(`/api/messages/${id}`);
      setMessages(data);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const initSocket = () => {
    const newSocket = io(API_CONFIG.SOCKET_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      // IMPORTANT: Rejoindre la room de la conversation
      newSocket.emit('join conversation', id);
      console.log(`📡 Joined room conv-${id}`);
    });

    newSocket.on('chat message', (msg: any) => {
      console.log('Received message:', msg);
      // Le message est déjà dans la room, on l'ajoute directement
      const messageToAdd: Message = {
        id: msg.id || Date.now(),
        sender: msg.pseudo || msg.sender,
        body: msg.text || msg.body,
        created_at: msg.created_at || new Date().toISOString(),
      };
      
      setMessages(prev => {
        // Éviter les doublons
        const exists = prev.some(m => 
          m.sender === messageToAdd.sender && 
          m.body === messageToAdd.body &&
          Math.abs(new Date(m.created_at).getTime() - new Date(messageToAdd.created_at).getTime()) < 1000
        );
        if (exists) return prev;
        return [...prev, messageToAdd];
      });
      setTimeout(() => scrollToBottom(), 100);
    });

    newSocket.on('conversation history', (payload: any) => {
      console.log('Received history:', payload);
      if (payload && String(payload.conversation_id) === String(id)) {
        const msgs = payload.messages || [];
        setMessages(msgs.map((m: any) => ({
          id: m.id,
          sender: m.sender || m.pseudo,
          body: m.body || m.content || m.text,
          created_at: m.created_at,
        })));
        setTimeout(() => scrollToBottom(), 100);
      }
    });

    setSocket(newSocket);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    const msgText = messageText.trim();
    setMessageText('');

    try {
      const messageData = {
        conversation_id: parseInt(id),
        pseudo: currentUser,
        text: msgText,
      };

      // Envoyer via Socket.IO (format compatible avec le serveur)
      if (socket && socket.connected) {
        socket.emit('chat message', messageData);
        console.log('Message sent via socket:', messageData);
      } else {
        console.error('Socket not connected!');
      }

      // Note: Le message sera ajouté via l'événement 'chat message' reçu du serveur
      // Pas besoin de l'ajouter localement ici pour éviter les doublons
      
    } catch (error) {
      console.error('Error sending message:', error);
      // En cas d'erreur, remettre le texte dans l'input
      setMessageText(msgText);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender === currentUser;

    return (
      <View
        style={[
          styles.messageWrapper,
          isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.body}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
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
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{username?.[0] || '?'}</Text>
        </View>
        <Text style={styles.headerTitle}>{username}</Text>
      </LinearGradient>

      {/* Messages */}
      <LinearGradient
        colors={['#06070a', '#0b0f14']}
        style={styles.messagesContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollToBottom()}
        />
      </LinearGradient>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient
          colors={['#0f1720', '#0b0f14']}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Écrivez un message..."
            placeholderTextColor="#64748b"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!messageText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={messageText.trim() ? '#eaf6ff' : '#64748b'}
            />
          </TouchableOpacity>
        </LinearGradient>
      </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(8, 200, 255, 0.1)',
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5ff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eaf6ff',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  ownMessage: {
    backgroundColor: 'rgba(14, 165, 255, 0.15)',
    borderColor: 'rgba(14, 165, 255, 0.3)',
  },
  otherMessage: {
    backgroundColor: 'rgba(15, 23, 32, 0.8)',
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  messageText: {
    fontSize: 15,
    color: '#eaf6ff',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(8, 200, 255, 0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 32, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 15,
    color: '#eaf6ff',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.15)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 255, 0.3)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
});
