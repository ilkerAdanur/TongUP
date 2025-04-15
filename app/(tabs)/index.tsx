import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LevelSelector } from '@/components/LevelSelector';
import { ExerciseCard } from '@/components/ExerciseCard';
import { StatsCard } from '@/components/StatsCard';
import { Card } from '@/components/Card';
import { useUserStore } from '@/store/user-store';
import { useExercisesStore } from '@/store/exercises-store';
import { useWordsStore } from '@/store/words-store';
import { BookOpen, MessageSquare, CheckSquare, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '@/components/ProgressBar';
import { useTheme } from '@/contexts/ThemeContext';
import { ProficiencyLevel } from '@/constants/languages';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    currentLanguage, 
    currentLevel, 
    setCurrentLanguage, 
    setCurrentLevel,
    profile,
    languageStats
  } = useUserStore();
  
  const { 
    getExercisesByLanguageAndLevel, 
    isExerciseCompleted,
    getCompletedExercisesCount,
    getSuccessRate
  } = useExercisesStore();
  
  const { getWordsByLanguageAndLevel, getLearnedWordsCount } = useWordsStore();
  const { colors } = useTheme();
  
  const [sentenceExercises, setSentenceExercises] = useState<any[]>([]);
  const [wordExercises, setWordExercises] = useState<any[]>([]);
  const [multipleChoiceExercises, setMultipleChoiceExercises] = useState<any[]>([]);
  
  useEffect(() => {
    // Get exercises for the selected language and level
    const sentenceTranslation = getExercisesByLanguageAndLevel(currentLanguage, currentLevel, 'sentenceTranslation');
    const wordTranslation = getExercisesByLanguageAndLevel(currentLanguage, currentLevel, 'wordTranslation');
    const multipleChoice = getExercisesByLanguageAndLevel(currentLanguage, currentLevel, 'multipleChoice');
    
    setSentenceExercises(sentenceTranslation);
    setWordExercises(wordTranslation);
    setMultipleChoiceExercises(multipleChoice);
  }, [currentLanguage, currentLevel]);
  
  const handleExercisePress = (type: string) => {
    router.push(`/exercise/${type}?language=${currentLanguage}&level=${currentLevel}`);
  };
  
  const isSentenceExerciseCompleted = sentenceExercises.length > 0 && 
    sentenceExercises.every(ex => isExerciseCompleted(ex.id));
  
  const isWordExerciseCompleted = wordExercises.length > 0 && 
    wordExercises.every(ex => isExerciseCompleted(ex.id));
  
  const isMultipleChoiceExerciseCompleted = multipleChoiceExercises.length > 0 && 
    multipleChoiceExercises.every(ex => isExerciseCompleted(ex.id));
  
  // Get stats for the current language
  const currentStats = languageStats.find(stat => stat.languageId === currentLanguage) || {
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  };
  
  const completedExercisesCount = getCompletedExercisesCount(currentLanguage);
  const successRate = getSuccessRate(currentLanguage);
  const wordsCount = getWordsByLanguageAndLevel(currentLanguage, currentLevel).length;
  const learnedWordsCount = getLearnedWordsCount ? getLearnedWordsCount(currentLanguage) : 0;
  
  // Calculate daily goal progress
  const dailyGoal = profile?.dailyWordGoal || 10;
  const dailyProgress = Math.min(learnedWordsCount / dailyGoal, 1);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primaryGradient[0], colors.primaryGradient[1]]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>TongUp</Text>
          <Text style={styles.subtitle}>Dil öğrenmeyi kolaylaştırır</Text>
        </View>
      </LinearGradient>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.selectors}>
          <LanguageSelector
            selectedLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
            availableLanguages={profile?.selectedLanguages}
            label="Dil"
          />
          
          <LevelSelector
            selectedLevel={currentLevel}
            onSelectLevel={(level: string) => setCurrentLevel(level as ProficiencyLevel)}
            label="Seviye"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alıştırmalar</Text>
          
          <ExerciseCard
            title="Cümle Çevirisi"
            description="Cümleleri Türkçe'ye çevirin"
            type="sentenceTranslation"
            completed={isSentenceExerciseCompleted}
            count={sentenceExercises.length}
            onPress={() => handleExercisePress('sentenceTranslation')}
            style={{ backgroundColor: colors.exerciseBackground }}
          />
          
          <ExerciseCard
            title="Kelime Çevirisi"
            description="Kelimeleri Türkçe'ye çevirin"
            type="wordTranslation"
            completed={isWordExerciseCompleted}
            count={wordExercises.length}
            onPress={() => handleExercisePress('wordTranslation')}
            style={{ backgroundColor: colors.exerciseBackground }}
          />
          
          <ExerciseCard
            title="Çoktan Seçmeli"
            description="Doğru çeviriyi seçin"
            type="multipleChoice"
            completed={isMultipleChoiceExerciseCompleted}
            count={multipleChoiceExercises.length}
            onPress={() => handleExercisePress('multipleChoice')}
            style={{ backgroundColor: colors.exerciseBackground }}
          />
        </View>
        
        <View style={styles.section}>
          <Card style={[styles.goalCard, { 
            borderColor: `${colors.primary}30`,
            backgroundColor: colors.exerciseBackground
          }]}>
            <View style={styles.goalHeader}>
              <Target size={24} color={colors.primary} />
              <Text style={[styles.goalTitle, { color: colors.text }]}>Günlük Kelime Hedefi</Text>
            </View>
            
            <View style={styles.goalProgress}>
              <View style={styles.goalNumbers}>
                <Text style={[styles.goalCurrent, { color: colors.primary }]}>{learnedWordsCount}</Text>
                <Text style={[styles.goalTarget, { color: colors.textLight }]}>/ {dailyGoal}</Text>
              </View>
              
              <ProgressBar 
                progress={dailyProgress} 
                height={10}
                colors={[colors.primaryGradient[0], colors.primaryGradient[1]]}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İstatistikler</Text>
          
          <StatsCard
            title={`${currentLanguage.toUpperCase()} İstatistikleri`}
            stats={[
              {
                label: "Öğrenilen Kelimeler",
                value: currentStats.wordsLearned,
                icon: <BookOpen size={20} color={colors.primary} />,
              },
              {
                label: "Tamamlanan Alıştırmalar",
                value: completedExercisesCount,
                icon: <MessageSquare size={20} color={colors.primary} />,
              },
              {
                label: "Başarı Oranı",
                value: `%${Math.round(successRate * 100)}`,
                icon: <CheckSquare size={20} color={colors.primary} />,
                progress: successRate,
              },
            ]}
            style={{ backgroundColor: colors.statsBackground }}
          />
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
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  selectors: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  goalCard: {
    padding: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalProgress: {
    marginBottom: 8,
  },
  goalNumbers: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  goalCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalTarget: {
    fontSize: 18,
  },
});