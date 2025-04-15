import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { useUserStore } from '@/store/user-store';
import { useWordsStore } from '@/store/words-store';
import { useGamesStore } from '@/store/games-store';
import { ArrowLeft, Clock, Award, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Word } from '@/types';

interface GameWord extends Word {
  userAnswer: string;
  isCorrect: boolean | null;
}

interface GameResults {
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  totalTime: number;
  incorrectWords: {
    word: string;
    translation: string;
    userAnswer: string;
  }[];
}

export default function ChallengeGameScreen() {
  const router = useRouter();
  const { currentLanguage } = useUserStore();
  const { getWordsByLanguage } = useWordsStore();
  const { addResult } = useGamesStore();
  const { colors } = useTheme();
  
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'results'>('setup');
  const [selectedWordCount, setSelectedWordCount] = useState(10);
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(2);
  const [gameWords, setGameWords] = useState<GameWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<GameResults>({
    correctAnswers: 0,
    incorrectAnswers: 0,
    skippedAnswers: 0,
    totalTime: 0,
    incorrectWords: [],
  });
  
  const [timeRemaining, setTimeRemaining] = useState(selectedTimeLimit * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<TextInput>(null);
  
  // Check if there are enough words
  useEffect(() => {
    const allWords = getWordsByLanguage(currentLanguage);
    if (allWords.length < 5) {
      Alert.alert(
        "Yetersiz Kelime",
        "Oyunu başlatmak için en az 5 kelime gereklidir. Lütfen daha fazla kelime ekleyin.",
        [{ 
          text: "Tamam", 
          onPress: () => router.back() 
        }]
      );
    }
  }, [currentLanguage, router]);
  
  // Setup game words
  useEffect(() => {
    if (gameState === 'playing') {
      setLoading(true);
      const allWords = getWordsByLanguage(currentLanguage);
      
      if (allWords.length < 5) {
        Alert.alert(
          "Yetersiz Kelime",
          "Oyunu başlatmak için en az 5 kelime gereklidir. Lütfen daha fazla kelime ekleyin.",
          [{ 
            text: "Tamam", 
            onPress: () => {
              setGameState('setup');
              router.back();
            }
          }]
        );
        return;
      }
      
      // Shuffle and select words
      const shuffled = [...allWords].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, selectedWordCount).map(word => ({
        ...word,
        userAnswer: '',
        isCorrect: null,
      }));
      
      setGameWords(selected);
      setTimeRemaining(selectedTimeLimit * 60);
      setIsTimerRunning(true);
      setLoading(false);
    }
  }, [gameState, currentLanguage, selectedWordCount, selectedTimeLimit, router, getWordsByLanguage]);
  
  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);
  
  const startGame = () => {
    setGameState('playing');
  };
  
  const endGame = () => {
    setIsTimerRunning(false);
    
    // Calculate results
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const incorrectWordsList: {
      word: string;
      translation: string;
      userAnswer: string;
    }[] = [];
    
    gameWords.forEach(word => {
      if (word.isCorrect === true) {
        correct++;
      } else if (word.isCorrect === false) {
        incorrect++;
        incorrectWordsList.push({
          word: word.word,
          translation: word.translation,
          userAnswer: word.userAnswer,
        });
      } else {
        skipped++;
        incorrectWordsList.push({
          word: word.word,
          translation: word.translation,
          userAnswer: 'Atlandı',
        });
      }
    });
    
    const totalTime = selectedTimeLimit * 60 - timeRemaining;
    
    setResults({
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      skippedAnswers: skipped,
      totalTime,
      incorrectWords: incorrectWordsList,
    });
    
    // Record game result
    addResult({
      gameType: 'challenge',
      languageId: currentLanguage,
      score: correct,
      totalQuestions: selectedWordCount,
      timeSpent: totalTime,
    });
    
    setGameState('results');
  };
  
  const handleSubmitAnswer = () => {
    if (currentWordIndex >= gameWords.length) return;
    
    const currentWord = gameWords[currentWordIndex];
    const isCorrect = userAnswer.trim().toLowerCase() === currentWord.translation.toLowerCase();
    
    const updatedWords = [...gameWords];
    updatedWords[currentWordIndex] = {
      ...currentWord,
      userAnswer: userAnswer.trim(),
      isCorrect,
    };
    
    setGameWords(updatedWords);
    setUserAnswer('');
    
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      endGame();
    }
  };
  
  const handleSkipWord = () => {
    if (currentWordIndex >= gameWords.length) return;
    
    const currentWord = gameWords[currentWordIndex];
    
    const updatedWords = [...gameWords];
    updatedWords[currentWordIndex] = {
      ...currentWord,
      userAnswer: '',
      isCorrect: null,
    };
    
    setGameWords(updatedWords);
    setUserAnswer('');
    
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      endGame();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleBackToGames = () => {
    router.replace('/games');
  };
  
  const handlePlayAgain = () => {
    setGameState('setup');
    setCurrentWordIndex(0);
    setUserAnswer('');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToGames}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meydan Okuma</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Oyun yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (gameState === 'setup') {
    const allWords = getWordsByLanguage(currentLanguage);
    const hasEnoughWords = allWords.length >= 5;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToGames}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meydan Okuma</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.setupContainer}>
          <Text style={[styles.setupTitle, { color: colors.text }]}>Meydan Okuma Ayarları</Text>
          
          <Card style={styles.setupCard}>
            <Text style={[styles.setupLabel, { color: colors.text }]}>Kelime Sayısı</Text>
            <View style={styles.optionsContainer}>
              {[5, 10, 20, 50, 100].map((count) => (
                <TouchableOpacity
                  key={`count-${count}`}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedWordCount === count ? {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: colors.primary,
                    } : null,
                  ]}
                  onPress={() => setSelectedWordCount(count)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedWordCount === count ? {
                      color: colors.primary,
                      fontWeight: 'bold',
                    } : null,
                  ]}>
                    {count} kelime
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          
          <Card style={styles.setupCard}>
            <Text style={[styles.setupLabel, { color: colors.text }]}>Süre Limiti</Text>
            <View style={styles.optionsContainer}>
              {[1, 2, 5, 10].map((time) => (
                <TouchableOpacity
                  key={`time-${time}`}
                  style={[
                    styles.optionButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedTimeLimit === time ? {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: colors.primary,
                    } : null,
                  ]}
                  onPress={() => setSelectedTimeLimit(time)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedTimeLimit === time ? {
                      color: colors.primary,
                      fontWeight: 'bold',
                    } : null,
                  ]}>
                    {time} dakika
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          
          {!hasEnoughWords && (
            <Text style={[styles.warningText, { color: colors.warning }]}>
              Oyunu başlatmak için en az 5 kelime gereklidir. Lütfen daha fazla kelime ekleyin.
            </Text>
          )}
          
          <Button
            title="Oyunu Başlat"
            onPress={startGame}
            style={styles.startButton}
            disabled={!hasEnoughWords}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  if (gameState === 'playing' && gameWords.length > 0) {
    const currentWord = gameWords[currentWordIndex];
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            Alert.alert(
              'Oyundan Çık',
              'Oyundan çıkmak istediğinizden emin misiniz? İlerlemeniz kaydedilmeyecek.',
              [
                {
                  text: 'İptal',
                  style: 'cancel',
                },
                {
                  text: 'Çık',
                  onPress: handleBackToGames,
                },
              ]
            );
          }}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meydan Okuma</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.gameContainer}>
            <View>
              <View style={styles.timerContainer}>
                <Clock size={20} color={timeRemaining < 30 ? colors.error : colors.text} />
                <Text style={[
                  styles.timerText, 
                  { color: timeRemaining < 30 ? colors.error : colors.text }
                ]}>
                  {formatTime(timeRemaining)}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: colors.textLight }]}>
                  {currentWordIndex + 1} / {gameWords.length}
                </Text>
                <ProgressBar progress={(currentWordIndex + 1) / gameWords.length} />
              </View>
              
              <Card style={styles.wordCard}>
                <Text style={[styles.wordText, { color: colors.text }]}>{currentWord.word}</Text>
                {currentWord.exampleSentence && (
                  <Text style={[styles.wordHint, { color: colors.textLight }]}>
                    "{currentWord.exampleSentence}"
                  </Text>
                )}
              </Card>
            </View>
            
            <View style={styles.answerContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.answerInput, { 
                  backgroundColor: colors.card, 
                  color: colors.text,
                  borderColor: colors.border
                }]}
                placeholder="Türkçe çevirisini yazın..."
                placeholderTextColor={colors.textLight}
                value={userAnswer}
                onChangeText={setUserAnswer}
                onSubmitEditing={handleSubmitAnswer}
                autoFocus
              />
              
              <View style={styles.actionButtons}>
                <Button
                  title="Atla"
                  onPress={handleSkipWord}
                  variant="outline"
                  style={[styles.skipButton, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }]}
                />
                
                <Button
                  title="Gönder"
                  onPress={handleSubmitAnswer}
                  style={styles.submitButton}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  if (gameState === 'results') {
    const accuracy = results.correctAnswers / (results.correctAnswers + results.incorrectAnswers) * 100 || 0;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToGames}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sonuçlar</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>Meydan Okuma Tamamlandı!</Text>
              <View style={[styles.scoreContainer, { 
                backgroundColor: `${colors.primary}15`
              }]}>
                <Award size={20} color={colors.primary} />
                <Text style={[styles.scoreText, { color: colors.primary }]}>
                  {results.correctAnswers} / {gameWords.length} doğru
                </Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(results.totalTime)}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Toplam Süre</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>%{Math.round(accuracy)}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Doğruluk</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{results.skippedAnswers}</Text>
                <Text style={[styles.statLabel, { color: colors.textLight }]}>Atlanan</Text>
              </View>
            </View>
            
            {results.incorrectWords.length > 0 && (
              <>
                <Text style={[styles.incorrectWordsTitle, { color: colors.text }]}>Yanlış Cevaplar</Text>
                
                {results.incorrectWords.map((item, index) => (
                  <Card key={index} style={styles.incorrectWordCard}>
                    <View style={styles.incorrectWordRow}>
                      <Text style={[styles.incorrectWordLabel, { color: colors.textLight }]}>Kelime:</Text>
                      <Text style={[styles.incorrectWordText, { color: colors.text }]}>{item.word}</Text>
                    </View>
                    
                    <View style={styles.incorrectWordRow}>
                      <Text style={[styles.incorrectWordLabel, { color: colors.textLight }]}>Senin cevabın:</Text>
                      <Text style={[styles.incorrectAnswerText, { color: colors.error }]}>{item.userAnswer}</Text>
                    </View>
                    
                    <View style={styles.incorrectWordRow}>
                      <Text style={[styles.incorrectWordLabel, { color: colors.textLight }]}>Doğru cevap:</Text>
                      <Text style={[styles.correctAnswerText, { color: colors.success }]}>{item.translation}</Text>
                    </View>
                  </Card>
                ))}
              </>
            )}
            
            <View style={styles.resultsButtons}>
              <Button
                title="Oyunlara Dön"
                onPress={handleBackToGames}
                variant="outline"
                style={[styles.skipButton, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }]}
              />
              
              <Button
                title="Tekrar Oyna"
                onPress={handlePlayAgain}
                style={styles.playAgainButton}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToGames}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meydan Okuma</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Oyun yükleniyor...</Text>
      </View>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  setupCard: {
    padding: 16,
    marginBottom: 24,
  },
  setupLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  startButton: {
    marginTop: 24,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  wordCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  wordText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wordHint: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  answerContainer: {
    marginBottom: 24,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderWidth: 1,
  },
  submitButton: {
    flex: 2,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  incorrectWordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  incorrectWordCard: {
    padding: 16,
    marginBottom: 12,
  },
  incorrectWordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  incorrectWordLabel: {
    fontSize: 14,
  },
  incorrectWordText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incorrectAnswerText: {
    fontSize: 16,
  },
  correctAnswerText: {
    fontSize: 16,
  },
  resultsButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  playAgainButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  warningText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontStyle: 'italic',
  },
});