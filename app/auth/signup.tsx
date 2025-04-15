import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock, User, UserPlus, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    if (!name.trim()) {
      newErrors.name = 'Ad alanı boş olamaz';
      isValid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = 'E-posta alanı boş olamaz';
      isValid = false;
    } else if (!email.includes('@')) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
      isValid = false;
    }
    
    if (!password.trim()) {
      newErrors.password = 'Şifre alanı boş olamaz';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const success = await signup(name, email, password);
      
      if (success) {
        Alert.alert(
          'Başarılı',
          'Hesabınız başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.',
          [
            {
              text: 'Tamam',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      } else {
        Alert.alert('Hata', 'Bu e-posta adresi zaten kullanılıyor');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = () => {
    router.replace('/auth/login');
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 24,
      justifyContent: 'center',
      minHeight: '100%',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
      marginTop: 20,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 16,
      marginBottom: 16,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    formContainer: {
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
      color: colors.text,
      textAlign: 'center',
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primaryGradient[0], colors.primaryGradient[1]]}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <BookOpen size={40} color="white" />
              </View>
            </LinearGradient>
            <Text style={styles.appName}>TongUp</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            
            <Input
              label="Ad Soyad"
              placeholder="Adınız ve soyadınız"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={colors.textLight} />}
              error={errors.name}
            />
            
            <Input
              label="E-posta"
              placeholder="E-posta adresiniz"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textLight} />}
              error={errors.email}
            />
            
            <Input
              label="Şifre"
              placeholder="Şifreniz"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textLight} />}
              error={errors.password}
            />
            
            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={colors.textLight} />}
              error={errors.confirmPassword}
            />
            
            <Button
              title="Kayıt Ol"
              onPress={handleSignUp}
              icon={<UserPlus size={18} color="white" />}
              loading={isLoading}
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}