import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LevelSelector } from '@/components/LevelSelector';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useUserStore } from '@/store/user-store';
import { useWordsStore } from '@/store/words-store';
import { useTheme } from '@/contexts/ThemeContext';

export default function AddWordScreen() {
  const router = useRouter();
  const { currentLanguage, currentLevel, profile } = useUserStore();
  const { addWord } = useWordsStore();
  const { colors } = useTheme();
  
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [errors, setErrors] = useState({
    word: '',
    translation: '',
  });
  
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
    
    addWord({
      word: word.trim(),
      translation: translation.trim(),
      languageId: selectedLanguage,
      proficiencyLevel: selectedLevel as any,
      exampleSentence: exampleSentence.trim() || undefined,
    });
    
    Alert.alert(
      'Başarılı',
      'Kelime başarıyla eklendi',
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
          title="Kelimeyi Kaydet"
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