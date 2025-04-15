import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { CalendarEventItem } from '@/components/CalendarEventItem';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Calendar, User, Book, Award, MessageSquare, CheckSquare } from 'lucide-react-native';

interface Friend {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  stats: {
    wordsLearned: number;
    exercisesCompleted: number;
    successRate: number;
  };
  languages: {
    id: string;
    name: string;
    flag: string;
    level: string;
  }[];
  calendarEvents: {
    id: string;
    title: string;
    description?: string;
    date: string;
    isCompleted: boolean;
  }[];
}

export default function FriendProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [friend, setFriend] = useState<Friend | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to get friend data
    const fetchFriend = () => {
      // Mock data
      const mockFriend: Friend = {
        id: id || '1',
        name: id === '1' ? 'Mehmet Yılmaz' : id === '2' ? 'Zeynep Kaya' : 'Emre Demir',
        email: id === '1' ? 'mehmet@example.com' : id === '2' ? 'zeynep@example.com' : 'emre@example.com',
        profilePicture: undefined,
        stats: {
          wordsLearned: 120,
          exercisesCompleted: 45,
          successRate: 0.78,
        },
        languages: [
          {
            id: 'en',
            name: 'İngilizce',
            flag: '🇬🇧',
            level: 'B1',
          },
          {
            id: 'de',
            name: 'Almanca',
            flag: '🇩🇪',
            level: 'A2',
          },
        ],
        calendarEvents: [
          {
            id: '1',
            title: 'İngilizce Çalışma Seansı',
            description: 'Phrasal verbs konusunu çalışacağım',
            date: new Date(Date.now() + 86400000).toISOString(),
            isCompleted: false,
          },
          {
            id: '2',
            title: 'Almanca Kelime Tekrarı',
            description: 'Günlük konuşma kelimeleri',
            date: new Date(Date.now() + 172800000).toISOString(),
            isCompleted: false,
          },
          {
            id: '3',
            title: 'Dil Kulübü Toplantısı',
            date: new Date(Date.now() - 86400000).toISOString(),
            isCompleted: true,
          },
        ],
      };
      
      setFriend(mockFriend);
      setLoading(false);
    };
    
    fetchFriend();
  }, [id]);
  
  if (loading || !friend) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profil Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Arkadaş Profili</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          {friend.profilePicture ? (
            <Image source={{ uri: friend.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <User size={40} color={colors.primary} />
            </View>
          )}
          
          <Text style={[styles.profileName, { color: colors.text }]}>{friend.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.textLight }]}>{friend.email}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
          
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Book size={24} color={colors.primary} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: colors.text }]}>{friend.stats.wordsLearned}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Kelime</Text>
              </View>
              
              <View style={styles.statItem}>
                <MessageSquare size={24} color={colors.primary} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: colors.text }]}>{friend.stats.exercisesCompleted}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Alıştırma</Text>
              </View>
              
              <View style={styles.statItem}>
                <CheckSquare size={24} color={colors.primary} style={styles.statIcon} />
                <Text style={[styles.statValue, { color: colors.text }]}>%{Math.round(friend.stats.successRate * 100)}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Başarı</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Öğrenilen Diller</Text>
          
          {friend.languages.map((language) => (
            <Card key={language.id} style={styles.languageCard}>
              <View style={styles.languageHeader}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: colors.text }]}>{language.name}</Text>
                  <View style={[styles.levelBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.levelText, { color: colors.primary }]}>{language.level}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Yaklaşan Etkinlikler</Text>
          </View>
          
          {friend.calendarEvents.length > 0 ? (
            friend.calendarEvents.map((event) => (
              <CalendarEventItem
                key={event.id}
                title={event.title}
                description={event.description}
                date={event.date}
                isCompleted={event.isCompleted}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.textLight }]}>
                Yaklaşan etkinlik bulunmuyor
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  languageCard: {
    padding: 16,
    marginBottom: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});