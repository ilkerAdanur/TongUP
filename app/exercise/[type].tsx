import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/constants/colors';
import { useExercisesStore } from '@/store/exercises-store';
import { useUserStore } from '@/store/user-store';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ExerciseScreen() {
  const { type, language, level } = useLocalSearchParams();
  const router = useRouter();
  const { getExercisesByLanguageAndLevel, markExerciseCompleted } = useExercisesStore();
  const { updateAchievementProgress } = useUserStore();
  const { colors } = useTheme();
  
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  
  useEffect(() => {
    if (language && level && type) {
      const exercisesData = getExercisesByLanguageAndLevel(
        language as string,
        level as string,
        type as string
      );
      setExercises(exercisesData);
    }
  }, [language, level, type]);
  
  const handleCheckAnswer = () => {
    const currentExercise = exercises[currentIndex];
    let correct = false;
    
    if (type === 'multipleChoice') {
      correct = selectedOption === currentExercise.correctAnswer;
    } else {
      // For sentence and word translation, do a case-insensitive comparison
      correct = userAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    }
    
    setIsCorrect(correct);
    setIsAnswered(true);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Mark exercise as completed
    markExerciseCompleted(currentExercise.id, correct);
    
    // Update achievement progress
    updateAchievementProgress('exercise-master', 1);
  };
  
  const handleNextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      // Exercise completed
      const successRate = correctCount / exercises.length;
      
      Alert.alert(
        'Alıştırma Tamamlandı',
        `Doğru: ${correctCount}/${exercises.length}
Başarı Oranı: %${Math.round(successRate * 100)}`,
        [
          {
            text: 'Ana Sayfaya Dön',
            onPress: () => router.push('/'),
          },
        ]
      );
    }
  };
  
  if (exercises.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Alıştırmalar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentExercise = exercises[currentIndex];
  const progress = (currentIndex + 1) / exercises.length;
  
  const renderExerciseContent = () => {
    switch (type) {
      case 'sentenceTranslation':
        return (
          <View style={styles.exerciseContent}>
            <Text style={[styles.questionText, { color: colors.text }]}>{currentExercise.question}</Text>
            
            <TextInput
              style={[styles.answerInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Cevabınızı buraya yazın..."
              placeholderTextColor={colors.textLight}
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              editable={!isAnswered}
            />
          </View>
        );
      
      case 'wordTranslation':
        return (
          <View style={styles.exerciseContent}>
            <Text style={[styles.questionText, { color: colors.text }]}>{currentExercise.question}</Text>
            
            <TextInput
              style={[styles.answerInput, { 
                backgroundColor: colors.card, 
                color: colors.text,
                borderColor: colors.border
              }]}
              placeholder="Cevabınızı buraya yazın..."
              placeholderTextColor={colors.textLight}
              value={userAnswer}
              onChangeText={setUserAnswer}
              editable={!isAnswered}
            />
          </View>
        );
      
      case 'multipleChoice':
        return (
          <View style={styles.exerciseContent}>
            <Text style={[styles.questionText, { color: colors.text }]}>{currentExercise.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentExercise.options?.map((option: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedOption === option && { 
                      borderColor: colors.secondary, 
                      backgroundColor: `${colors.secondary}10` 
                    },
                    isAnswered && option === currentExercise.correctAnswer && { 
                      borderColor: colors.success, 
                      backgroundColor: `${colors.success}10` 
                    },
                    isAnswered && selectedOption === option && 
                    selectedOption !== currentExercise.correctAnswer && { 
                      borderColor: colors.error, 
                      backgroundColor: `${colors.error}10` 
                    },
                  ]}
                  onPress={() => !isAnswered && setSelectedOption(option)}
                  disabled={isAnswered}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedOption === option && { 
                      color: colors.secondary, 
                      fontWeight: 'bold' 
                    },
                    isAnswered && option === currentExercise.correctAnswer && { 
                      color: colors.success, 
                      fontWeight: 'bold' 
                    },
                    isAnswered && selectedOption === option && 
                    selectedOption !== currentExercise.correctAnswer && { 
                      color: colors.error, 
                      fontWeight: 'bold' 
                    },
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textLight }]}>
            {currentIndex + 1} / {exercises.length}
          </Text>
          <ProgressBar progress={progress} />
        </View>
        
        <Card style={styles.exerciseCard}>
          {renderExerciseContent()}
          
          {isAnswered && (
            <View style={styles.resultContainer}>
              {isCorrect ? (
                <View style={styles.correctContainer}>
                  <CheckCircle size={24} color={colors.success} />
                  <Text style={[styles.correctText, { color: colors.success }]}>Doğru!</Text>
                </View>
              ) : (
                <View style={styles.wrongContainer}>
                  <XCircle size={24} color={colors.error} />
                  <Text style={[styles.wrongText, { color: colors.error }]}>Yanlış!</Text>
                  <Text style={[styles.correctAnswerText, { color: colors.text }]}>
                    Doğru cevap: {currentExercise.correctAnswer}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
      
      <View style={[styles.footer, { 
        borderTopColor: colors.border,
        backgroundColor: colors.card
      }]}>
        {!isAnswered ? (
          <Button
            title="Kontrol Et"
            onPress={handleCheckAnswer}
            disabled={
              (type === 'multipleChoice' && !selectedOption) ||
              ((type === 'sentenceTranslation' || type === 'wordTranslation') && !userAnswer.trim())
            }
          />
        ) : (
          <Button
            title={currentIndex < exercises.length - 1 ? "Sonraki Soru" : "Bitir"}
            onPress={handleNextQuestion}
            icon={<ArrowRight size={18} color="white" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  exerciseCard: {
    padding: 24,
  },
  exerciseContent: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  answerInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    gap: 12,
  },
  optionItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  correctContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  correctText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  wrongContainer: {
    alignItems: 'center',
    gap: 8,
  },
  wrongText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  correctAnswerText: {
    fontSize: 16,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});