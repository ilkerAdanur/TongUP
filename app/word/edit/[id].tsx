import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LevelSelector } from '@/components/LevelSelector';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useUserStore } from '@/store/user-store';
import { useWordsStore } from '@/store/words-store';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditWordScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useUserStore();
  const { words, updateWord } = useWordsStore();
  const { colors } = useTheme();
  
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [errors, setErrors] = useState({
    word: '',
    translation: '',
  });
  
  useEffect(() => {
    if (id) {
      const wordToEdit = words.find(w => w.id === id);
      if (wordToEdit) {
        setWord(wordToEdit.word);
        setTranslation(wordToEdit.translation);
        setExampleSentence(wordToEdit.exampleSentence || '');
        setSelectedLanguage(wordToEdit.languageId);
        setSelectedLevel(wordToEdit.proficiencyLevel);
      } else {
        Alert.alert('Hata', 'Kelime bulunamadı');
        router.back();
      }
    }
  }, [id]);
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      word: '',
      translation: '',
    };
    
    if (!word.trim()) {
      newErrors.word = 'Kelime alanı boş olamaz';
      isValid = false;
    }
    
    if (!translation.trim()) {
      newErrors.translation = 'Çeviri alanı boş olamaz';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    updateWord(id as string, {
      word: word.trim(),
      translation: translation.trim(),
      languageId: selectedLanguage,
      proficiencyLevel: selectedLevel as any,
      exampleSentence: exampleSentence.trim() || undefined,
    });
    
    Alert.alert(
      'Başarılı',
      'Kelime başarıyla güncellendi',
      [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
            availableLanguages={profile.selectedLanguages}
            label="Dil"
          />
          
          <LevelSelector
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            label="Seviye"
          />
          
          <Input
            label="Kelime"
            placeholder="Öğrenmek istediğiniz kelimeyi girin"
            value={word}
            onChangeText={setWord}
            error={errors.word}
          />
          
          <Input
            label="Çeviri"
            placeholder="Kelimenin Türkçe çevirisini girin"
            value={translation}
            onChangeText={setTranslation}
            error={errors.translation}
          />
          
          <Input
            label="Örnek Cümle (İsteğe Bağlı)"
            placeholder="Kelimeyi içeren bir örnek cümle girin"
            value={exampleSentence}
            onChangeText={setExampleSentence}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { 
        borderTopColor: colors.border,
        backgroundColor: colors.card
      }]}>
        <Button
          title="Değişiklikleri Kaydet"
          onPress={handleSubmit}
        />
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
  formContainer: {
    marginBottom: 24,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});