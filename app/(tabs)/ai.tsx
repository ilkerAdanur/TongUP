import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { Send, Trash2, Sparkles, Languages } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/user-store';
import { languages } from '@/constants/languages';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTheme } from '@/contexts/ThemeContext';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
};

export default function AIScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslationMode, setIsTranslationMode] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { currentLanguage } = useUserStore();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const { colors } = useTheme();
  
  // Get the current language name
  const languageName = languages.find(lang => lang.id === selectedLanguage)?.name || 'English';
  
  // Load messages from storage on component mount
  useEffect(() => {
    loadMessages();
  }, []);
  
  // Save messages to storage whenever they change
  useEffect(() => {
    saveMessages();
  }, [messages]);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].text.includes("VocaBuddy AI"))) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Merhaba! Ben VocaBuddy AI Asistanı. Size ${languageName} dilinde çeviri konusunda yardımcı olabilirim veya herhangi bir konuda sohbet edebiliriz. Nasıl yardımcı olabilirim?`,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedLanguage]);
  
  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('ai-chat-messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Add welcome message if no messages exist
        setMessages([
          {
            id: Date.now().toString(),
            text: `Merhaba! Ben VocaBuddy AI Asistanı. Size ${languageName} dilinde çeviri konusunda yardımcı olabilirim veya herhangi bir konuda sohbet edebiliriz. Nasıl yardımcı olabilirim?`,
            isUser: false,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response;
      if (isTranslationMode) {
        response = await translateText(input.trim(), selectedLanguage);
      } else {
        response = await chatWithAI(input.trim(), selectedLanguage);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        isUser: false,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const translateText = async (text: string, languageCode: string): Promise<string> => {
    try {
      const apiKey = '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';
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      
      const languageMap: Record<string, string> = {
        'en': 'English',
        'de': 'German',
        'fr': 'French',
        'es': 'Spanish',
        'it': 'Italian',
      };
      
      const targetLang = languageMap[languageCode] || 'English';
      
      // Detect if the input is Turkish or the target language
      const isInputTurkish = await detectLanguage(text);
      
      let systemPrompt;
      if (isInputTurkish) {
        // If input is Turkish, translate to target language
        systemPrompt = `You are a helpful translation assistant. Translate the following text from Turkish to ${targetLang}. Provide only the translation without any explanations or additional text.`;
      } else {
        // If input is not Turkish, translate to Turkish
        systemPrompt = `You are a helpful translation assistant. Translate the following text from ${targetLang} to Turkish. Provide only the translation without any explanations or additional text.`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vocabuddy.app', // Required by OpenRouter
          'X-Title': 'VocaBuddy Language App' // Required by OpenRouter
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat', // Specify the model with provider prefix
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation API error:', error);
      return `Çeviri yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin. (Error: ${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  };
  
  const detectLanguage = async (text: string): Promise<boolean> => {
    try {
      const apiKey = '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';
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vocabuddy.app',
          'X-Title': 'VocaBuddy Language App'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a language detection assistant. Analyze the given text and determine if it is Turkish. Respond with only "true" if the text is Turkish, or "false" if it is not Turkish.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
        }),
      });
      
      if (!response.ok) {
        // Default to assuming it's Turkish if detection fails
        return true;
      }
      
      const data = await response.json();
      const result = data.choices[0].message.content.trim().toLowerCase();
      return result.includes('true');
    } catch (error) {
      console.error('Language detection error:', error);
      // Default to assuming it's Turkish if detection fails
      return true;
    }
  };
  
  const chatWithAI = async (text: string, languageCode: string): Promise<string> => {
    try {
      const apiKey = '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';
      const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      
      const languageMap: Record<string, string> = {
        'en': 'English',
        'de': 'German',
        'fr': 'French',
        'es': 'Spanish',
        'it': 'Italian',
      };
      
      const targetLang = languageMap[languageCode] || 'English';
      
      // Get previous messages for context (last 5 messages)
      const contextMessages = messages.slice(-5).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Detect if the input is Turkish or the target language
      const isInputTurkish = await detectLanguage(text);
      
      // FIXED: Always respond in the selected language when in chat mode
      const systemPrompt = `You are VocaBuddy AI, a helpful assistant for language learning. 
      You help users learn ${targetLang}. 
      The user may write in Turkish or ${targetLang}.
      IMPORTANT: You must ALWAYS respond in ${targetLang} regardless of what language the user writes in.
      Keep responses concise, helpful and conversational.
      You can discuss any topic, answer questions about ${targetLang} culture, provide language tips, or just chat casually.`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://vocabuddy.app', // Required by OpenRouter
          'X-Title': 'VocaBuddy Language App' // Required by OpenRouter
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat', // Specify the model with provider prefix
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            ...contextMessages,
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Chat API error:', error);
      return `Üzgünüm, şu anda API'ye bağlanamıyorum. Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}. Lütfen daha sonra tekrar deneyin.`;
    }
  };
  
  const clearChat = () => {
    Alert.alert(
      'Sohbeti Temizle',
      'Tüm sohbet geçmişini silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            // Keep only the welcome message
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              text: `Merhaba! Ben VocaBuddy AI Asistanı. Size ${languageName} dilinde çeviri konusunda yardımcı olabilirim veya herhangi bir konuda sohbet edebiliriz. Nasıl yardımcı olabilirim?`,
              isUser: false,
              timestamp: Date.now(),
            };
            
            setMessages([welcomeMessage]);
          },
        },
      ]
    );
  };
  
  const toggleMode = () => {
    setIsTranslationMode(!isTranslationMode);
    
    // Add a system message about the mode change
    const modeChangeMessage: Message = {
      id: Date.now().toString(),
      text: isTranslationMode 
        ? `Sohbet moduna geçildi. Artık benimle ${languageName} dilinde sohbet edebilirsiniz.`
        : 'Çeviri moduna geçildi. Şimdi çeviri yapabilirim.',
      isUser: false,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, modeChangeMessage]);
  };
  
  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    
    // Add a system message about the language change
    const languageChangeMessage: Message = {
      id: Date.now().toString(),
      text: `Dil değiştirildi: ${languages.find(lang => lang.id === langId)?.name || 'Bilinmeyen dil'}`,
      isUser: false,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, languageChangeMessage]);
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        {!item.isUser && (
          <View style={[styles.aiIconContainer, { backgroundColor: colors.primary }]}>
            <Sparkles size={16} color="white" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          item.isUser 
            ? [styles.userMessageBubble, { backgroundColor: colors.primary }] 
            : [styles.aiMessageBubble, { backgroundColor: colors.aiBackground, borderColor: colors.border }]
        ]}>
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : [styles.aiMessageText, { color: colors.text }]
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 16,
      paddingBottom: 16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    headerContent: {
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    headerSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    modeButtonText: {
      color: 'white',
      marginLeft: 6,
      fontSize: 14,
    },
    clearButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: 8,
      borderRadius: 20,
    },
    languageSelectorContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    messagesList: {
      padding: 16,
      paddingTop: 8,
    },
    messageContainer: {
      marginBottom: 16,
      maxWidth: '80%',
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    userMessageContainer: {
      alignSelf: 'flex-end',
    },
    aiMessageContainer: {
      alignSelf: 'flex-start',
    },
    aiIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    messageBubble: {
      padding: 12,
      borderRadius: 16,
    },
    userMessageBubble: {
      borderTopRightRadius: 4,
    },
    aiMessageBubble: {
      borderTopLeftRadius: 4,
      borderWidth: 1,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userMessageText: {
      color: 'white',
    },
    aiMessageText: {
      color: colors.text,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    input: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxHeight: 100,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    sendButtonDisabled: {
      backgroundColor: colors.textLight,
      opacity: 0.7,
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight] as [string, string]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Asistanı</Text>
          <Text style={styles.headerSubtitle}>
            {isTranslationMode 
              ? 'Çeviri Modu' // FIXED: Simplified text for translation mode
              : `${languageName} Sohbet Modu`}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
            <Languages size={20} color="white" />
            <Text style={styles.modeButtonText}>
              {isTranslationMode ? 'Sohbet Modu' : 'Çeviri Modu'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Trash2 size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <View style={styles.languageSelectorContainer}>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleLanguageChange}
          availableLanguages={['en', 'de', 'fr', 'es', 'it']}
          label="Dil Seçiniz"
        />
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={[styles.inputContainer, { backgroundColor: colors.card }]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text, borderColor: colors.border }]}
          placeholder={isTranslationMode 
            ? "Çevirmek istediğiniz metni girin..." 
            : "Mesajınızı yazın..."}
          value={input}
          onChangeText={setInput}
          multiline
          placeholderTextColor={colors.placeholder}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || isLoading) && styles.sendButtonDisabled,
            { backgroundColor: input.trim() && !isLoading ? colors.primary : colors.textLight }
          ]}
          onPress={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Send size={20} color="white" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}