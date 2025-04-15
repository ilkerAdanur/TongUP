import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWordsStore } from '@/store/words-store';
import { useUserStore } from '@/store/user-store';
import { useGamesStore } from '@/store/games-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArrowLeft, Check, X, Clock, Award, Shuffle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

type GameParams = {
  type: 'wordMatching' | 'wordWriting' | 'wordSelection' | 'jumbledLetters';
  language?: string;
};

export default function GameScreen() {
  const { type, language } = useLocalSearchParams<GameParams>();
  const router = useRouter();
  const { getWordsByLanguage } = useWordsStore();
  const { currentLanguage, updateLanguageStat } = useUserStore();
  const { addResult } = useGamesStore();
  const { colors } = useTheme();
  
  const [gameWords, setGameWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<any[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [jumbledWord, setJumbledWord] = useState('');
  const [selectedPairs, setSelectedPairs] = useState<{[key: string]: string}>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchingOptions, setMatchingOptions] = useState<{word: string, translation: string}[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  
  const gameLanguage = language || currentLanguage;
  const words = getWordsByLanguage(gameLanguage);
  
  // Prepare game words
  useEffect(() => {
    if (words.length < 5) {
      Alert.alert(
        "Yetersiz Kelime",
        "Oyunu başlatmak için en az 5 kelime gereklidir. Lütfen daha fazla kelime ekleyin.",
        [{ text: "Tamam", onPress: () => router.back() }]
      );
      return;
    }
    
    // Shuffle and select 10 words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setGameWords(selected);
    
    if (type === 'wordSelection') {
      prepareSelectionOptions(selected[0], shuffled);
    } else if (type === 'jumbledLetters') {
      setJumbledWord(jumbleWord(selected[0].word));
    } else if (type === 'wordMatching') {
      prepareMatchingOptions(selected);
    }
  }, [words, type]);
  
  // Start timer when game starts
  useEffect(() => {
    if (gameStarted && !gameFinished) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameFinished]);
  
  const prepareSelectionOptions = (currentWord: any, allWords: any[]) => {
    // Get current word translation
    const correctAnswer = currentWord.translation;
    
    // Get 3 random incorrect translations
    const otherTranslations = allWords
      .filter(w => w.id !== currentWord.id)
      .map(w => w.translation)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Combine and shuffle
    const options = [correctAnswer, ...otherTranslations].sort(() => 0.5 - Math.random());
    setShuffledOptions(options);
  };
  
  const prepareMatchingOptions = (selectedWords: any[]) => {
    // Create pairs of words and translations
    const pairs = selectedWords.map(word => ({
      word: word.word,
      translation: word.translation
    }));
    
    // Shuffle the pairs
    setMatchingOptions(pairs.sort(() => 0.5 - Math.random()));
  };
  
  const jumbleWord = (word: string) => {
    return word.split('').sort(() => 0.5 - Math.random()).join('');
  };
  
  const startGame = () => {
    setGameStarted(true);
  };
  
  const checkAnswer = () => {
    const currentWord = gameWords[currentIndex];
    let isAnswerCorrect = false;
    
    if (type === 'wordWriting') {
      // For word writing, compare with translation
      isAnswerCorrect = userAnswer.trim().toLowerCase() === currentWord.translation.toLowerCase();
    } else if (type === 'jumbledLetters') {
      // For jumbled letters, compare with original word
      isAnswerCorrect = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
    } else if (type === 'wordSelection') {
      // For word selection, compare selected option with translation
      isAnswerCorrect = selectedOption?.toLowerCase() === currentWord.translation.toLowerCase();
    }
    
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Track incorrect answers
      setIncorrectAnswers(prev => [
        ...prev, 
        { 
          word: currentWord.word, 
          translation: currentWord.translation,
          userAnswer: type === 'wordSelection' ? selectedOption : userAnswer
        }
      ]);
    }
    
    // Move to next word after a delay
    setTimeout(() => {
      if (currentIndex < gameWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setUserAnswer('');
        setIsCorrect(null);
        setSelectedOption(null);
        
        if (type === 'wordSelection') {
          prepareSelectionOptions(gameWords[currentIndex + 1], words);
        } else if (type === 'jumbledLetters') {
          setJumbledWord(jumbleWord(gameWords[currentIndex + 1].word));
        }
        
        // Focus input for word writing and jumbled letters
        if (type === 'wordWriting' || type === 'jumbledLetters') {
          inputRef.current?.focus();
        }
      } else {
        // Game finished
        finishGame();
      }
    }, 1000);
  };
  
  const checkMatchingGame = () => {
    // Check if all pairs are matched
    const allMatched = matchingOptions.every(pair => 
      selectedPairs[pair.word] === pair.translation
    );
    
    if (allMatched) {
      // Calculate score based on correct matches
      const correctMatches = matchingOptions.filter(pair => 
        selectedPairs[pair.word] === pair.translation
      ).length;
      
      setScore(correctMatches);
      finishGame();
    } else {
      // Show which ones are incorrect
      const incorrectMatches = matchingOptions.filter(pair => 
        selectedPairs[pair.word] && selectedPairs[pair.word] !== pair.translation
      );
      
      setIncorrectAnswers(incorrectMatches.map(pair => ({
        word: pair.word,
        translation: pair.translation,
        userAnswer: selectedPairs[pair.word]
      })));
      
      Alert.alert(
        "Eşleştirme Tamamlanmadı",
        "Bazı eşleştirmeler yanlış veya eksik. Lütfen kontrol edin ve tekrar deneyin.",
        [{ text: "Tamam" }]
      );
    }
  };
  
  const handlePairSelection = (word: string, translation: string) => {
    setSelectedPairs(prev => ({
      ...prev,
      [word]: translation
    }));
  };
  
  const finishGame = () => {
    setGameFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Calculate accuracy
    const accuracy = score / gameWords.length;
    
    // Update language stats
    updateLanguageStat(gameLanguage, {
      gamesPlayed: 1,
      successRate: accuracy
    });
    
    // Add game result
    addResult({
      gameType: type as string,
      languageId: gameLanguage,
      score,
      totalQuestions: gameWords.length,
      timeSpent,
    });
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getGameTitle = () => {
    switch (type) {
      case 'wordMatching':
        return 'Kelime Eşleştirme';
      case 'wordWriting':
        return 'Kelime Yazma';
      case 'wordSelection':
        return 'Kelime Seçme';
      case 'jumbledLetters':
        return 'Karışık Harfler';
      default:
        return 'Oyun';
    }
  };
  
  const getGameInstructions = () => {
    switch (type) {
      case 'wordMatching':
        return 'Kelimeleri doğru çevirileriyle eşleştirin.';
      case 'wordWriting':
        return 'Gösterilen kelimenin Türkçe çevirisini yazın.';
      case 'wordSelection':
        return 'Gösterilen kelimenin doğru çevirisini seçenekler arasından bulun.';
      case 'jumbledLetters':
        return 'Karışık harflerden doğru kelimeyi oluşturun.';
      default:
        return '';
    }
  };
  
  const renderGameContent = () => {
    if (!gameStarted) {
      return (
        <Card style={[styles.startCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>{getGameTitle()}</Text>
          <Text style={[styles.gameInstructions, { color: colors.textLight }]}>
            {getGameInstructions()}
          </Text>
          <Button 
            title="Oyunu Başlat" 
            onPress={startGame}
            icon={<Award size={18} color="white" />}
            style={styles.startButton}
          />
        </Card>
      );
    }
    
    if (gameFinished) {
      const accuracy = (score / gameWords.length) * 100;
      
      return (
        <Card style={[styles.resultCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>Oyun Tamamlandı!</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{score}/{gameWords.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Doğru Cevap</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{formatTime(timeSpent)}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Süre</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>%{Math.round(accuracy)}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Başarı</Text>
            </View>
          </View>
          
          {incorrectAnswers.length > 0 && (
            <View style={styles.incorrectAnswersContainer}>
              <Text style={[styles.incorrectAnswersTitle, { color: colors.text }]}>
                Yanlış Cevaplar:
              </Text>
              {incorrectAnswers.slice(0, 5).map((item, index) => (
                <Text key={index} style={[styles.incorrectAnswer, { color: colors.textLight }]}>
                  • {item.word} = {item.translation} 
                  {item.userAnswer ? ` (Cevabınız: ${item.userAnswer})` : ''}
                </Text>
              ))}
              {incorrectAnswers.length > 5 && (
                <Text style={[styles.moreIncorrect, { color: colors.textLight }]}>
                  ...ve {incorrectAnswers.length - 5} daha fazla
                </Text>
              )}
            </View>
          )}
          
          <View style={styles.resultButtonsContainer}>
            <Button
              title="Ana Menüye Dön"
              onPress={() => router.push('/games')}
              variant="outline"
              style={styles.resultButton}
            />
            <Button
              title="Tekrar Oyna"
              onPress={() => {
                setGameStarted(false);
                setGameFinished(false);
                setCurrentIndex(0);
                setScore(0);
                setTimeSpent(0);
                setUserAnswer('');
                setIsCorrect(null);
                setIncorrectAnswers([]);
                
                // Reshuffle words
                const shuffled = [...words].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 10);
                setGameWords(selected);
                
                if (type === 'wordSelection') {
                  prepareSelectionOptions(selected[0], shuffled);
                } else if (type === 'jumbledLetters') {
                  setJumbledWord(jumbleWord(selected[0].word));
                } else if (type === 'wordMatching') {
                  prepareMatchingOptions(selected);
                }
              }}
              style={styles.resultButton}
            />
          </View>
        </Card>
      );
    }
    
    if (type === 'wordMatching') {
      return (
        <View style={styles.matchingContainer}>
          <View style={styles.gameProgressContainer}>
            <Text style={[styles.gameProgress, { color: colors.text }]}>
              Eşleştirme Oyunu
            </Text>
            <View style={styles.timerContainer}>
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.timer, { color: colors.text }]}>{formatTime(timeSpent)}</Text>
            </View>
          </View>
          
          <Text style={[styles.matchingInstructions, { color: colors.textLight }]}>
            Soldaki kelimeleri sağdaki doğru çevirileriyle eşleştirin.
          </Text>
          
          <View style={styles.matchingColumns}>
            <View style={styles.matchingColumn}>
              <Text style={[styles.columnHeader, { color: colors.text }]}>Kelimeler</Text>
              {matchingOptions.map((pair, index) => (
                <TouchableOpacity 
                  key={`word-${index}`}
                  style={[
                    styles.matchingItem, 
                    { backgroundColor: selectedPairs[pair.word] ? colors.primary + '20' : colors.card }
                  ]}
                  onPress={() => {
                    // Select this word for pairing
                    setSelectedOption(pair.word);
                  }}
                >
                  <Text style={[
                    styles.matchingItemText, 
                    { color: selectedPairs[pair.word] ? colors.primary : colors.text }
                  ]}>
                    {pair.word}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.matchingColumn}>
              <Text style={[styles.columnHeader, { color: colors.text }]}>Çeviriler</Text>
              {matchingOptions.map((pair, index) => (
                <TouchableOpacity 
                  key={`translation-${index}`}
                  style={[
                    styles.matchingItem, 
                    { 
                      backgroundColor: Object.values(selectedPairs).includes(pair.translation) 
                        ? colors.primary + '20' 
                        : colors.card 
                    }
                  ]}
                  onPress={() => {
                    // If a word is selected, pair it with this translation
                    if (selectedOption) {
                      handlePairSelection(selectedOption, pair.translation);
                      setSelectedOption(null);
                    }
                  }}
                >
                  <Text style={[
                    styles.matchingItemText, 
                    { 
                      color: Object.values(selectedPairs).includes(pair.translation) 
                        ? colors.primary 
                        : colors.text 
                    }
                  ]}>
                    {pair.translation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Button
            title="Eşleştirmeleri Kontrol Et"
            onPress={checkMatchingGame}
            style={styles.checkButton}
          />
        </View>
      );
    }
    
    if (!gameWords.length) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }
    
    const currentWord = gameWords[currentIndex];
    
    return (
      <View style={styles.gameContainer}>
        <View style={styles.gameProgressContainer}>
          <Text style={[styles.gameProgress, { color: colors.text }]}>
            {currentIndex + 1}/{gameWords.length}
          </Text>
          <View style={styles.timerContainer}>
            <Clock size={16} color={colors.primary} />
            <Text style={[styles.timer, { color: colors.text }]}>{formatTime(timeSpent)}</Text>
          </View>
        </View>
        
        {type === 'jumbledLetters' ? (
          <Card style={[styles.wordCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.jumbledWord, { color: colors.primary }]}>{jumbledWord}</Text>
            <Text style={[styles.wordPrompt, { color: colors.textLight }]}>
              Yukarıdaki karışık harflerden doğru kelimeyi oluşturun
            </Text>
          </Card>
        ) : (
          <Card style={[styles.wordCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.word, { color: colors.text }]}>{currentWord.word}</Text>
            <Text style={[styles.wordPrompt, { color: colors.textLight }]}>
              {type === 'wordWriting' 
                ? 'Bu kelimenin Türkçe çevirisini yazın' 
                : 'Bu kelimenin doğru çevirisini seçin'}
            </Text>
          </Card>
        )}
        
        {isCorrect !== null && (
          <View style={[
            styles.feedbackContainer,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            {isCorrect ? (
              <Check size={24} color="white" />
            ) : (
              <X size={24} color="white" />
            )}
            <Text style={styles.feedbackText}>
              {isCorrect ? 'Doğru!' : `Yanlış! Doğru cevap: ${currentWord.translation}`}
            </Text>
          </View>
        )}
        
        {type === 'wordWriting' || type === 'jumbledLetters' ? (
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text
              }]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder={type === 'wordWriting' ? "Çeviriyi yazın..." : "Kelimeyi yazın..."}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              editable={isCorrect === null}
            />
            <Button
              title="Kontrol Et"
              onPress={checkAnswer}
              disabled={!userAnswer.trim() || isCorrect !== null}
              style={styles.checkButton}
            />
          </View>
        ) : type === 'wordSelection' ? (
          <View style={styles.optionsContainer}>
            {shuffledOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: selectedOption === option 
                      ? colors.primary 
                      : colors.card,
                    borderColor: colors.border
                  },
                  isCorrect !== null && option === currentWord.translation && styles.correctOption,
                  isCorrect !== null && selectedOption === option && option !== currentWord.translation && styles.incorrectOption
                ]}
                onPress={() => {
                  if (isCorrect === null) {
                    setSelectedOption(option);
                  }
                }}
                disabled={isCorrect !== null}
              >
                <Text style={[
                  styles.optionText,
                  { color: selectedOption === option ? 'white' : colors.text },
                  isCorrect !== null && option === currentWord.translation && styles.correctOptionText,
                  isCorrect !== null && selectedOption === option && option !== currentWord.translation && styles.incorrectOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            
            <Button
              title="Kontrol Et"
              onPress={checkAnswer}
              disabled={!selectedOption || isCorrect !== null}
              style={styles.checkButton}
            />
          </View>
        ) : null}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    startCard: {
      padding: 24,
      alignItems: 'center',
    },
    gameTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    gameInstructions: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    startButton: {
      minWidth: 200,
    },
    gameContainer: {
      flex: 1,
    },
    gameProgressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    gameProgress: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timer: {
      marginLeft: 8,
      fontSize: 16,
    },
    wordCard: {
      padding: 24,
      alignItems: 'center',
      marginBottom: 24,
    },
    word: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    jumbledWord: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 16,
      letterSpacing: 4,
    },
    wordPrompt: {
      fontSize: 16,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 24,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 16,
    },
    checkButton: {
      marginTop: 8,
    },
    feedbackContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    correctFeedback: {
      backgroundColor: colors.success,
    },
    incorrectFeedback: {
      backgroundColor: colors.error,
    },
    feedbackText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    optionsContainer: {
      marginBottom: 24,
    },
    optionButton: {
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      marginBottom: 12,
      alignItems: 'center',
    },
    optionText: {
      fontSize: 16,
    },
    correctOption: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    incorrectOption: {
      backgroundColor: colors.error,
      borderColor: colors.error,
    },
    correctOptionText: {
      color: 'white',
      fontWeight: 'bold',
    },
    incorrectOptionText: {
      color: 'white',
      fontWeight: 'bold',
    },
    resultCard: {
      padding: 24,
    },
    resultTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 14,
    },
    incorrectAnswersContainer: {
      marginBottom: 24,
    },
    incorrectAnswersTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    incorrectAnswer: {
      fontSize: 14,
      marginBottom: 4,
    },
    moreIncorrect: {
      fontSize: 14,
      fontStyle: 'italic',
      marginTop: 4,
    },
    resultButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    resultButton: {
      flex: 1,
      marginHorizontal: 8,
    },
    matchingContainer: {
      flex: 1,
    },
    matchingInstructions: {
      fontSize: 16,
      marginBottom: 16,
      textAlign: 'center',
    },
    matchingColumns: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    matchingColumn: {
      flex: 1,
      marginHorizontal: 8,
    },
    columnHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
    matchingItem: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    matchingItemText: {
      fontSize: 14,
      textAlign: 'center',
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getGameTitle()}</Text>
      </View>
      
      <View style={styles.content}>
        {renderGameContent()}
      </View>
    </SafeAreaView>
  );
}