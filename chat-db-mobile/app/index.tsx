import React, { useState, useEffect } from 'react';
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
  Animated,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../config/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG } from '../config/api';

WebBrowser.maybeCompleteAuthSession();

const API_URL = API_CONFIG.BASE_URL; // Utilise la config centralisée

export default function LoginScreen() {
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Écouter les liens profonds pour OAuth callback
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const handleDeepLink = async ({ url }: { url: string }) => {
    if (url.startsWith('myapp://auth')) {
      try {
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('token');
        const userJson = params.get('user');

        if (token && userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('currentUser', user.username);
          await AsyncStorage.setItem('userId', user.id.toString());
          
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('Erreur deep link:', error);
        Alert.alert('Erreur', 'Échec de la connexion OAuth');
      }
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      const authUrl = `${API_URL}/auth/${provider}`;
      await WebBrowser.openAuthSessionAsync(authUrl, 'myapp://auth');
    } catch (error) {
      console.error(`Erreur ${provider} OAuth:`, error);
      Alert.alert('Erreur', `Impossible de se connecter via ${provider}`);
    }
  };

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
            
            {/* Boutons OAuth */}
            <View style={styles.oauthContainer}>
              <Text style={styles.oauthTitle}>Connexion rapide</Text>
              
              <TouchableOpacity 
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('google')}
              >
                <Text style={styles.oauthButtonText}>🔵 Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('github')}
              >
                <Text style={styles.oauthButtonText}>⚫ GitHub</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('facebook')}
              >
                <Text style={styles.oauthButtonText}>🔵 Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.oauthButton}
                onPress={() => handleOAuthLogin('discord')}
              >
                <Text style={styles.oauthButtonText}>🟣 Discord</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>
            
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
  oauthContainer: {
    width: '100%',
    marginBottom: 20,
  },
  oauthTitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
  },
  oauthButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
    alignItems: 'center',
  },
  oauthButtonText: {
    color: '#eaf6ff',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#94a3b8',
    marginHorizontal: 10,
    fontSize: 12,
  },
});
