import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock, LogIn, BookOpen, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Register for the auth callback
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, googleLogin } = useAuthStore();
  const { colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });
  
  // Handle Google Sign-In response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
    };
    
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
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      const success = await login(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', 'Geçersiz e-posta veya şifre');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async (idToken: string) => {
    try {
      setIsLoading(true);
      const success = await googleLogin(idToken);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', 'Google ile giriş yapılırken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Google ile giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = () => {
    promptAsync();
  };
  
  const handleSignUp = () => {
    router.push('/auth/signup');
  };
  
  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
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
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 20,
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    appSlogan: {
      fontSize: 16,
      color: colors.textLight,
      textAlign: 'center',
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
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
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
    signUpText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 10,
      color: colors.textLight,
    },
    googleButton: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    googleButtonText: {
      color: colors.text,
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={[colors.primaryGradient[0], colors.primaryGradient[1]]}
            style={styles.logo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <BookOpen size={50} color="white" />
            </View>
          </LinearGradient>
          <Text style={styles.appName}>TongUp</Text>
          <Text style={styles.appSlogan}>Dil öğrenmeyi kolaylaştırır</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Giriş Yap</Text>
          
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
          
          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
          
          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            icon={<LogIn size={18} color="white" />}
            loading={isLoading}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <Button
            title="Google ile Giriş Yap"
            onPress={handleGoogleSignIn}
            style={styles.googleButton}
            textStyle={styles.googleButtonText}
            icon={<LogOut size={18} color={colors.text} />}
            loading={isLoading}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabınız yok mu?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}