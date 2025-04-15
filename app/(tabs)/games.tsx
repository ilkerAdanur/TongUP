import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GameCard } from '@/components/GameCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useUserStore } from '@/store/user-store';
import { useGamesStore } from '@/store/games-store';
import { useTheme } from '@/contexts/ThemeContext';
import { Award, Dices, Gamepad2, Puzzle, Zap } from 'lucide-react-native';

export default function GamesScreen() {
  const router = useRouter();
  const { currentLanguage, setCurrentLanguage, profile } = useUserStore();
  const { getTotalGamesPlayed, getAverageScoreByGame } = useGamesStore();
  const { colors } = useTheme();
  
  const handleGamePress = (type: string) => {
    router.push(`/game/${type}?language=${currentLanguage}`);
  };
  
  const handleChallengePress = () => {
    router.push('/game/challenge');
  };
  
  // Safeguard against undefined profile
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Oyunlar</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          Eğlenceli oyunlarla kelime bilginizi test edin
        </Text>
        
        <LanguageSelector
          selectedLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          availableLanguages={profile?.selectedLanguages || ['en']}
          label="Dil"
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <GameCard
          title="Meydan Okuma"
          description="Belirli bir süre içinde kelimeleri çevirin"
          icon={<Zap size={24} color={colors.primary} />}
          onPress={handleChallengePress}
          stats={[
            {
              label: "Oynanma",
              value: getTotalGamesPlayed('challenge').toString(),
            },
            {
              label: "Başarı",
              value: `%${Math.round(getAverageScoreByGame('challenge') * 100)}`,
            },
          ]}
          style={{ backgroundColor: colors.gameCardBackground }}
        />
        
        <GameCard
          title="Kelime Eşleştirme"
          description="Kelimeleri doğru çevirileriyle eşleştirin"
          icon={<Puzzle size={24} color={colors.primary} />}
          onPress={() => handleGamePress('wordMatching')}
          stats={[
            {
              label: "Oynanma",
              value: getTotalGamesPlayed('wordMatching').toString(),
            },
            {
              label: "Başarı",
              value: `%${Math.round(getAverageScoreByGame('wordMatching') * 100)}`,
            },
          ]}
          style={{ backgroundColor: colors.gameCardBackground }}
        />
        
        <GameCard
          title="Kelime Yazma"
          description="Gösterilen kelimelerin çevirilerini yazın"
          icon={<Award size={24} color={colors.primary} />}
          onPress={() => handleGamePress('wordWriting')}
          stats={[
            {
              label: "Oynanma",
              value: getTotalGamesPlayed('wordWriting').toString(),
            },
            {
              label: "Başarı",
              value: `%${Math.round(getAverageScoreByGame('wordWriting') * 100)}`,
            },
          ]}
          style={{ backgroundColor: colors.gameCardBackground }}
        />
        
        <GameCard
          title="Kelime Seçme"
          description="Doğru çeviriyi seçenekler arasından bulun"
          icon={<Dices size={24} color={colors.primary} />}
          onPress={() => handleGamePress('wordSelection')}
          stats={[
            {
              label: "Oynanma",
              value: getTotalGamesPlayed('wordSelection').toString(),
            },
            {
              label: "Başarı",
              value: `%${Math.round(getAverageScoreByGame('wordSelection') * 100)}`,
            },
          ]}
          style={{ backgroundColor: colors.gameCardBackground }}
        />
        
        <GameCard
          title="Karışık Harfler"
          description="Karışık harflerden doğru kelimeyi oluşturun"
          icon={<Gamepad2 size={24} color={colors.primary} />}
          onPress={() => handleGamePress('jumbledLetters')}
          stats={[
            {
              label: "Oynanma",
              value: getTotalGamesPlayed('jumbledLetters').toString(),
            },
            {
              label: "Başarı",
              value: `%${Math.round(getAverageScoreByGame('jumbledLetters') * 100)}`,
            },
          ]}
          style={{ backgroundColor: colors.gameCardBackground }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});