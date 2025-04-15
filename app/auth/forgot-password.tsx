import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { Mail, ArrowLeft, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuthStore();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const validateForm = () => {
    if (!email.trim()) {
      setError('E-posta alanı boş olamaz');
      return false;
    } else if (!email.includes('@')) {
      setError('Geçerli bir e-posta adresi girin');
      return false;
    }
    
    setError('');
    return true;
  };
  
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const success = await forgotPassword(email);
      
      if (success) {
        Alert.alert(
          'Başarılı',
          'Şifre sıfırlama talimatları e-posta adresinize gönderildi.',
          [
            {
              text: 'Tamam',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      } else {
        Alert.alert('Hata', 'Bu e-posta adresi ile kayıtlı bir hesap bulunamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Şifre sıfırlama işlemi sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textLight,
      marginBottom: 32,
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: 24,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    footerText: {
      color: colors.textLight,
      marginRight: 4,
    },
    loginText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          Kayıtlı e-posta adresinizi girin ve şifre sıfırlama talimatlarını göndereceğiz.
        </Text>
        
        <View style={styles.formContainer}>
          <Input
            label="E-posta"
            placeholder="E-posta adresiniz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textLight} />}
            error={error}
          />
          
          <Button
            title="Şifre Sıfırlama Gönder"
            onPress={handleResetPassword}
            icon={<Send size={18} color="white" />}
            loading={isLoading}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Şifrenizi hatırladınız mı?</Text>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.loginText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}