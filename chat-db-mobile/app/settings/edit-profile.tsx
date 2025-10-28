import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../config/api';
import { router } from 'expo-router';

const API_URL = API_CONFIG.BASE_URL;

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    photo_url: '',
    provider: 'local'
  });
  const [newUsername, setNewUsername] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions requises',
          'Nous avons besoin de votre permission pour accéder à la caméra et à la galerie.'
        );
      }
    }
  };

  const loadProfile = async () => {
    try {
      // Essayer d'abord avec le token JWT (OAuth)
      let token = await AsyncStorage.getItem('token');
      
      // Si pas de token, c'est une connexion classique avec pseudo
      if (!token) {
        const username = await AsyncStorage.getItem('currentUser');
        if (!username) {
          Alert.alert('Erreur', 'Session expirée');
          router.replace('/');
          return;
        }
        
        // Pour l'instant, simuler un profil avec le pseudo
        setProfile({
          username: username,
          email: '',
          photo_url: '',
          provider: 'local'
        });
        setNewUsername(username);
        setLoading(false);
        return;
      }

      // Si token JWT existe, récupérer le profil complet depuis l'API
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setNewUsername(data.username);
      } else {
        throw new Error('Impossible de charger le profil');
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (useCamera = false) => {
    try {
      let result;

      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur sélection image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem('token');

      // Si pas de token, c'est une connexion classique sans OAuth
      if (!token) {
        Alert.alert(
          'Fonctionnalité non disponible',
          'L\'upload de photo est disponible uniquement avec la connexion OAuth (Google, Facebook, etc.)'
        );
        setUploading(false);
        return;
      }

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type
      } as any);

      const response = await fetch(`${API_URL}/api/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, photo_url: data.photoUrl });
        Alert.alert('Succès', 'Photo de profil mise à jour !');
      } else {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error('Échec de l\'upload');
      }
    } catch (error: any) {
      console.error('Erreur upload:', error);
      Alert.alert('Erreur', error?.message || 'Impossible d\'uploader la photo');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une source',
      [
        {
          text: 'Appareil photo',
          onPress: () => pickImage(true)
        },
        {
          text: 'Galerie',
          onPress: () => pickImage(false)
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  };

  const updateUsername = async () => {
    if (newUsername.trim().length < 3) {
      Alert.alert('Erreur', 'Le pseudo doit contenir au moins 3 caractères');
      return;
    }

    if (newUsername.trim() === profile.username) {
      Alert.alert('Info', 'Aucun changement détecté');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/profile/username`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, username: data.username });
        await AsyncStorage.setItem('username', data.username);
        Alert.alert('Succès', 'Pseudo mis à jour !');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Échec de la mise à jour');
      }
    } catch (error: any) {
      console.error('Erreur mise à jour pseudo:', error);
      Alert.alert('Erreur', error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#06070a', '#0b0f14']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0ea5ff" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  const photoUrl = profile.photo_url 
    ? (profile.photo_url.startsWith('http') ? profile.photo_url : `${API_URL}${profile.photo_url}`)
    : null;

  const hasOAuth = profile.provider !== 'local';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#06070a', '#0b0f14']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header avec bouton retour */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#eaf6ff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Section Photo de profil */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              onPress={hasOAuth ? showImageOptions : undefined} 
              disabled={uploading || !hasOAuth} 
              activeOpacity={hasOAuth ? 0.8 : 1}
            >
              <View style={styles.photoContainer}>
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, styles.photoPlaceholder]}>
                    <Text style={styles.photoPlaceholderText}>
                      {profile.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color="#fff" size="large" />
                  </View>
                )}
                {hasOAuth && (
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={20} color="#eaf6ff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.changePhotoText}>
              {uploading 
                ? 'Upload en cours...' 
                : hasOAuth 
                  ? 'Toucher pour changer' 
                  : 'Photo disponible avec OAuth uniquement'}
            </Text>
          </View>

          {/* Section Informations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} color="#0ea5ff" /> Informations
            </Text>
            
            {/* Pseudo */}
            <View style={styles.card}>
              <Text style={styles.label}>Pseudo</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  placeholder="Votre pseudo"
                  placeholderTextColor="#64748b"
                  maxLength={30}
                />
                {newUsername !== profile.username && (
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={updateUsername}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#eaf6ff" />
                    ) : (
                      <Ionicons name="checkmark" size={20} color="#eaf6ff" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Email (read-only) */}
            {profile.email && (
              <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.readOnlyContainer}>
                  <Ionicons name="mail-outline" size={16} color="#94a3b8" />
                  <Text style={styles.readOnlyValue}>{profile.email}</Text>
                </View>
              </View>
            )}

            {/* Provider */}
            <View style={styles.card}>
              <Text style={styles.label}>Méthode de connexion</Text>
              <View style={styles.providerBadge}>
                <Ionicons 
                  name={profile.provider === 'local' ? 'key-outline' : 'shield-checkmark-outline'} 
                  size={16} 
                  color="#0ea5ff" 
                />
                <Text style={styles.providerText}>
                  {profile.provider === 'local' ? 'Connexion classique' : profile.provider.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(8, 200, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#eaf6ff',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(14, 165, 255, 0.3)',
  },
  photoPlaceholder: {
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: '#0ea5ff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0ea5ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0b0f14',
  },
  changePhotoText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#eaf6ff',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  label: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(6, 7, 10, 0.8)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#eaf6ff',
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.15)',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0ea5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(6, 7, 10, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  readOnlyValue: {
    fontSize: 15,
    color: '#94a3b8',
    flex: 1,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(14, 165, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 255, 0.3)',
  },
  providerText: {
    color: '#0ea5ff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
