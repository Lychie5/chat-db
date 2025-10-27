import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ThemeScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState('dark');

  const themes = [
    {
      id: 'dark',
      name: 'Sombre',
      icon: 'moon',
      description: 'Idéal pour une utilisation de nuit',
      colors: ['#06070a', '#0b0f14'] as const,
    },
    {
      id: 'light',
      name: 'Clair',
      icon: 'sunny',
      description: 'Parfait pour la journée',
      colors: ['#f8fafc', '#e2e8f0'] as const,
      disabled: true,
    },
    {
      id: 'auto',
      name: 'Automatique',
      icon: 'contrast',
      description: 'Suit les paramètres système',
      colors: ['#1e293b', '#334155'] as const,
      disabled: true,
    },
  ];

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    await AsyncStorage.setItem('theme', themeId);
    // TODO: Implémenter le changement de thème réel
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
        <Text style={styles.headerTitle}>Thème</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#06070a', '#0b0f14']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Choisissez l'apparence de l'application
            </Text>

            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  selectedTheme === theme.id && styles.themeCardSelected,
                ]}
                onPress={() => !theme.disabled && handleThemeSelect(theme.id)}
                disabled={theme.disabled}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={theme.colors}
                  style={styles.themePreview}
                >
                  <Ionicons
                    name={theme.icon as any}
                    size={32}
                    color={theme.disabled ? '#64748b' : '#0ea5ff'}
                  />
                </LinearGradient>

                <View style={styles.themeInfo}>
                  <View style={styles.themeHeader}>
                    <Text style={styles.themeName}>
                      {theme.name}
                      {theme.disabled && (
                        <Text style={styles.comingSoon}> (Bientôt)</Text>
                      )}
                    </Text>
                    {selectedTheme === theme.id && !theme.disabled && (
                      <Ionicons name="checkmark-circle" size={24} color="#0ea5ff" />
                    )}
                  </View>
                  <Text style={styles.themeDescription}>{theme.description}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Aperçu */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Aperçu</Text>
              <View style={styles.previewCard}>
                <LinearGradient
                  colors={['#0b0f14', '#0f1720']}
                  style={styles.previewContent}
                >
                  <View style={styles.previewMessage}>
                    <View style={styles.previewAvatar}>
                      <Text style={styles.previewAvatarText}>A</Text>
                    </View>
                    <View style={styles.previewMessageContent}>
                      <Text style={styles.previewName}>Alice</Text>
                      <Text style={styles.previewText}>Salut ! Comment ça va ?</Text>
                    </View>
                  </View>
                  <View style={styles.previewMessage}>
                    <View style={styles.previewAvatar}>
                      <Text style={styles.previewAvatarText}>B</Text>
                    </View>
                    <View style={styles.previewMessageContent}>
                      <Text style={styles.previewName}>Bob</Text>
                      <Text style={styles.previewText}>Super bien, et toi ?</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#94a3b8" />
              <Text style={styles.infoText}>
                Le thème sombre est optimisé pour réduire la fatigue oculaire et économiser la batterie sur les écrans OLED.
              </Text>
            </View>
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
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
  },
  themeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(8, 200, 255, 0.08)',
  },
  themeCardSelected: {
    borderColor: '#0ea5ff',
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
  },
  themePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#eaf6ff',
  },
  comingSoon: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '400',
  },
  themeDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
  previewSection: {
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.15)',
  },
  previewContent: {
    padding: 16,
  },
  previewMessage: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14, 165, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0ea5ff',
  },
  previewMessageContent: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 2,
  },
  previewText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
