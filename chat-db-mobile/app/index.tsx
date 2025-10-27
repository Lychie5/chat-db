import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!pseudo.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un pseudo');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/login', { pseudo: pseudo.trim() });
      
      if (response.success) {
        await AsyncStorage.setItem('currentUser', pseudo.trim());
        // Naviguer vers l'écran home
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Erreur de connexion', 
        error.message || 'Impossible de se connecter au serveur.\n\nVérifiez que la variable DATABASE_URL est configurée sur Render.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#06070a', '#0b0f14', '#0f1720']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.loginCard, { opacity: fadeAnim }]}>
            <Text style={styles.emoji}>💬</Text>
            <Text style={styles.title}>Bienvenue sur Meo !</Text>
            <Text style={styles.subtitle}>Connectez-vous pour commencer</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Entrez votre pseudo..."
                placeholderTextColor="#94a3b8"
                value={pseudo}
                onChangeText={setPseudo}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#666', '#555'] : ['#0ea5ff', '#0b8cf0']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(15, 23, 32, 0.9)',
    borderRadius: 16,
    padding: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#eaf6ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: '#eaf6ff',
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.04)',
    fontSize: 16,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
