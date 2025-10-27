import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FAQItem {
  question: string;
  answer: string;
  icon: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'Comment ajouter un ami ?',
      answer: 'Allez dans l\'onglet Amis, tapez le pseudo de votre ami dans la barre de recherche, puis appuyez sur le bouton +. Votre ami recevra une notification et pourra accepter votre demande.',
      icon: 'person-add',
    },
    {
      question: 'Comment démarrer une conversation ?',
      answer: 'Une fois que vous êtes amis, vous pouvez cliquer sur le bouton de bulle de conversation à côté du nom de votre ami, ou entrer son nom dans la page Conversations et cliquer sur Démarrer.',
      icon: 'chatbubbles',
    },
    {
      question: 'Comment gérer les notifications ?',
      answer: 'Rendez-vous dans Profil > Notifications pour personnaliser vos préférences. Vous pouvez activer/désactiver les sons, vibrations et aperçus de messages.',
      icon: 'notifications',
    },
    {
      question: 'Mes messages sont-ils sécurisés ?',
      answer: 'Oui ! Toutes vos conversations sont stockées de manière sécurisée et chiffrées. Seuls vous et votre destinataire pouvez lire vos messages.',
      icon: 'shield-checkmark',
    },
    {
      question: 'Comment bloquer un utilisateur ?',
      answer: 'Allez dans Profil > Confidentialité > Utilisateurs bloqués. Cette fonctionnalité sera bientôt disponible.',
      icon: 'ban',
    },
    {
      question: 'Comment changer mon mot de passe ?',
      answer: 'Cette fonctionnalité sera bientôt disponible dans les paramètres du profil.',
      icon: 'key',
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@chatapp.com?subject=Support%20ChatApp');
  };

  const handleReportBug = () => {
    Linking.openURL('mailto:bugs@chatapp.com?subject=Bug%20Report');
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
        <Text style={styles.headerTitle}>Aide</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#06070a', '#0b0f14']}
          style={styles.gradient}
        >
          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Ionicons name="help-circle" size={48} color="#0ea5ff" />
            <Text style={styles.welcomeTitle}>Centre d'aide</Text>
            <Text style={styles.welcomeText}>
              Trouvez des réponses à vos questions ou contactez notre support
            </Text>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions fréquentes</Text>
            
            {faqItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color="#0ea5ff" 
                  />
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={expandedId === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#94a3b8"
                  />
                </View>
                
                {expandedId === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Besoin d'aide ?</Text>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={handleContactSupport}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#0ea5ff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Contacter le support</Text>
                <Text style={styles.contactText}>
                  Notre équipe vous répondra dans les 24h
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={handleReportBug}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="bug" size={24} color="#0ea5ff" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Signaler un bug</Text>
                <Text style={styles.contactText}>
                  Aidez-nous à améliorer l'application
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Version */}
          <View style={styles.versionSection}>
            <Text style={styles.versionText}>ChatApp v1.0.0</Text>
            <Text style={styles.versionSubtext}>
              Dernière mise à jour : Octobre 2025
            </Text>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#94a3b8" />
            <Text style={styles.infoText}>
              Pour toute question urgente, contactez-nous directement par email à support@chatapp.com
            </Text>
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
    paddingTop: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    padding: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eaf6ff',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  faqItem: {
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    color: '#eaf6ff',
    fontWeight: '500',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 48,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 32, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(8, 200, 255, 0.08)',
    gap: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eaf6ff',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(14, 165, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
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
