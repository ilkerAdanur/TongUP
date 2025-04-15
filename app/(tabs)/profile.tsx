import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Switch, Modal, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { AchievementItem } from '@/components/AchievementItem';
import { useUserStore } from '@/store/user-store';
import { useAuthStore } from '@/store/auth-store';
import { useTheme } from '@/contexts/ThemeContext';
import { languages } from '@/constants/languages';
import { User, Settings, LogOut, Moon, Sun, Award, ChevronRight, Edit2, Trash2, X, Target, Camera, Upload } from 'lucide-react-native';
import { LanguageSelector } from '@/components/LanguageSelector';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, resetProgress, languageStats } = useUserStore();
  const { logout, user } = useAuthStore();
  const { colors, isDark, toggleTheme } = useTheme();
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || user?.name || '',
    email: profile?.email || user?.email || '',
  });
  const [newDailyGoal, setNewDailyGoal] = useState(profile?.dailyWordGoal?.toString() || '10');
  
  // Safeguard against undefined profile
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleEditProfile = () => {
    setEditedProfile({
      name: profile.name || user?.name || '',
      email: profile.email || user?.email || '',
    });
    setEditModalVisible(true);
  };
  
  const handleSaveProfile = () => {
    updateProfile({
      name: editedProfile.name,
      email: editedProfile.email,
    });
    
    setEditModalVisible(false);
  };

  const handleOpenGoalModal = () => {
    setNewDailyGoal(profile.dailyWordGoal?.toString() || '10');
    setGoalModalVisible(true);
  };

  const handleSaveGoal = () => {
    const dailyWordGoal = parseInt(newDailyGoal);
    
    if (isNaN(dailyWordGoal) || dailyWordGoal <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir günlük kelime hedefi girin.');
      return;
    }
    
    updateProfile({
      dailyWordGoal,
    });
    
    setGoalModalVisible(false);
  };

  const handleOpenLanguageModal = () => {
    setLanguageModalVisible(true);
  };
  
  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Profil fotoğrafınızı değiştirmek için bir seçenek belirleyin',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Kamera',
          onPress: () => {
            Alert.alert('Bilgi', 'Bu özellik yakında gelecek!');
          },
        },
        {
          text: 'Galeri',
          onPress: () => {
            Alert.alert('Bilgi', 'Bu özellik yakında gelecek!');
          },
        },
      ]
    );
  };
  
  const handleDeleteProgress = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Tüm ilerlemeniz silinecek. Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('Başarılı', 'İlerlemeniz sıfırlandı.');
          },
        },
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };
  
  const handleNotificationSettings = () => {
    // Navigate to notification settings
    Alert.alert('Bildirim Ayarları', 'Bu özellik yakında gelecek!');
  };
  
  const handlePrivacySettings = () => {
    // Navigate to privacy settings
    Alert.alert('Gizlilik Ayarları', 'Bu özellik yakında gelecek!');
  };
  
  const handleAbout = () => {
    // Navigate to about screen
    Alert.alert('Hakkında', 'TongUp v1.0.0\n\nRork AI tarafından geliştirildi');
  };
  
  const unlockedAchievements = profile.achievements.filter(a => a.isUnlocked);
  const lockedAchievements = profile.achievements.filter(a => !a.isUnlocked);
  
  const displayedAchievements = showAllAchievements 
    ? profile.achievements 
    : [...unlockedAchievements, ...lockedAchievements.slice(0, 2)];
  
  // Use user data from auth store if available
  const displayName = profile.name || user?.name || 'Kullanıcı';
  const displayEmail = profile.email || user?.email || '';

  // Get flag emoji for a language
  const getLanguageFlag = (languageId: string) => {
    const language = languages.find(l => l.id === languageId);
    return language ? language.flag : '';
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleChangeProfilePicture}
            >
              {profile.profilePicture ? (
                <View style={styles.avatarWrapper}>
                  <Image 
                    source={{ uri: profile.profilePicture }} 
                    style={styles.avatarImage} 
                  />
                  <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
                    <Camera size={14} color="white" />
                  </View>
                </View>
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                  <User size={40} color={colors.textLight} />
                  <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
                    <Camera size={14} color="white" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.userEmail, { color: colors.textLight }]}>{displayEmail}</Text>
              
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit2 size={14} color={colors.primary} />
                <Text style={[styles.editButtonText, { color: colors.primary }]}>Profili Düzenle</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.selectedLanguages.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Dil</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{unlockedAchievements.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Başarı</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{profile.dailyWordGoal}</Text>
              <Text style={[styles.statLabel, { color: colors.textLight }]}>Günlük Hedef</Text>
            </View>
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Dil İstatistikleri</Text>
          
          <Card style={styles.languageStatsContainer}>
            {languageStats.map((stat) => {
              const language = languages.find(l => l.id === stat.languageId);
              if (!language) return null;
              
              return (
                <View key={stat.languageId} style={styles.languageStat}>
                  <View style={styles.languageHeader}>
                    <View style={styles.languageNameContainer}>
                      <Text style={styles.languageFlag}>{getLanguageFlag(stat.languageId)}</Text>
                      <Text style={[styles.languageName, { color: colors.text }]}>{language.name}</Text>
                    </View>
                    <Text style={[styles.wordsLearned, { color: colors.primary }]}>
                      {stat.wordsLearned} kelime
                    </Text>
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItemSmall}>
                      <Text style={[styles.statValueSmall, { color: colors.text }]}>{stat.exercisesCompleted}</Text>
                      <Text style={[styles.statLabelSmall, { color: colors.textLight }]}>Alıştırma</Text>
                    </View>
                    
                    <View style={styles.statItemSmall}>
                      <Text style={[styles.statValueSmall, { color: colors.text }]}>{stat.gamesPlayed}</Text>
                      <Text style={[styles.statLabelSmall, { color: colors.textLight }]}>Oyun</Text>
                    </View>
                    
                    <View style={styles.statItemSmall}>
                      <Text style={[styles.statValueSmall, { color: colors.text }]}>{stat.successRate}%</Text>
                      <Text style={[styles.statLabelSmall, { color: colors.textLight }]}>Başarı</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
          
          <View style={styles.achievementsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Başarılar</Text>
            <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {showAllAchievements ? 'Daha Az Göster' : 'Tümünü Göster'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsContainer}>
            {displayedAchievements.map((achievement) => (
              <AchievementItem
                key={achievement.id}
                achievement={achievement}
              />
            ))}
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Ayarlar</Text>
          
          <Card style={styles.settingsContainer}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleOpenGoalModal}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Target size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Günlük Kelime Hedefi</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: colors.textLight }]}>{profile.dailyWordGoal}</Text>
                <ChevronRight size={20} color={colors.textLight} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={toggleTheme}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  {isDark ? (
                    <Moon size={20} color={colors.primary} />
                  ) : (
                    <Sun size={20} color={colors.primary} />
                  )}
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Karanlık Mod</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={isDark ? colors.primary : '#f4f3f4'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleOpenLanguageModal}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Settings size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Dil Ayarları</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleNotificationSettings}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Settings size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Bildirim Ayarları</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handlePrivacySettings}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Settings size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Gizlilik Ayarları</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleAbout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Settings size={20} color={colors.primary} />
                </View>
                <Text style={[styles.settingText, { color: colors.text }]}>Hakkında</Text>
              </View>
              <ChevronRight size={20} color={colors.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerSettingItem]}
              onPress={handleDeleteProgress}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.error}15` }]}>
                  <Trash2 size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingText, { color: colors.error }]}>İlerlemeyi Sıfırla</Text>
              </View>
              <ChevronRight size={20} color={colors.error} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingItem, styles.dangerSettingItem, styles.lastSettingItem]}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.error}15` }]}>
                  <LogOut size={20} color={colors.error} />
                </View>
                <Text style={[styles.settingText, { color: colors.error }]}>Çıkış Yap</Text>
              </View>
              <ChevronRight size={20} color={colors.error} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
      
      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Profili Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ad Soyad</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }
                ]}
                value={editedProfile.name}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor={colors.textLight}
              />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>E-posta</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }
                ]}
                value={editedProfile.email}
                onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                placeholder="E-posta adresiniz"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.modalActions}>
                <Button
                  title="İptal"
                  onPress={() => setEditModalVisible(false)}
                  style={styles.cancelButton}
                  textStyle={{ color: colors.text }}
                  variant="outline"
                />
                <Button
                  title="Kaydet"
                  onPress={handleSaveProfile}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Daily Goal Modal */}
      <Modal
        visible={goalModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Günlük Kelime Hedefi</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Günlük Hedef</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.border
                  }
                ]}
                value={newDailyGoal}
                onChangeText={setNewDailyGoal}
                placeholder="Günlük kelime hedefi"
                placeholderTextColor={colors.textLight}
                keyboardType="number-pad"
              />
              
              <View style={styles.goalSuggestions}>
                {[5, 10, 15, 20, 25].map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalSuggestion,
                      parseInt(newDailyGoal) === goal ? 
                        { backgroundColor: colors.primary } : 
                        { backgroundColor: `${colors.primary}20` }
                    ]}
                    onPress={() => setNewDailyGoal(goal.toString())}
                  >
                    <Text
                      style={[
                        styles.goalSuggestionText,
                        parseInt(newDailyGoal) === goal ? 
                          { color: 'white' } : 
                          { color: colors.primary }
                      ]}
                    >
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="İptal"
                  onPress={() => setGoalModalVisible(false)}
                  style={styles.cancelButton}
                  textStyle={{ color: colors.text }}
                  variant="outline"
                />
                <Button
                  title="Kaydet"
                  onPress={handleSaveGoal}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Language Settings Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Dil Ayarları</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={[styles.modalSubtitle, { color: colors.text }]}>Öğrenmek istediğiniz dilleri seçin</Text>
              
              <View style={styles.languageList}>
                {languages.map((language) => {
                  const isSelected = profile.selectedLanguages.includes(language.id);
                  
                  return (
                    <TouchableOpacity
                      key={language.id}
                      style={[
                        styles.languageItem,
                        { 
                          backgroundColor: isSelected ? `${colors.primary}15` : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border
                        }
                      ]}
                      onPress={() => {
                        // Don't allow deselecting English if it's the only language
                        if (language.id === 'en' && isSelected && profile.selectedLanguages.length === 1) {
                          Alert.alert('Uyarı', 'En az bir dil seçili olmalıdır.');
                          return;
                        }
                        
                        const { toggleLanguageSelection } = useUserStore.getState();
                        toggleLanguageSelection(language.id);
                      }}
                    >
                      <Text style={styles.languageItemFlag}>{language.flag}</Text>
                      <Text style={[styles.languageItemName, { color: colors.text }]}>{language.name}</Text>
                      <View style={[
                        styles.languageItemCheckbox,
                        isSelected ? 
                          { backgroundColor: colors.primary, borderColor: colors.primary } : 
                          { backgroundColor: 'transparent', borderColor: colors.border }
                      ]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <Button
                title="Kapat"
                onPress={() => setLanguageModalVisible(false)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageStatsContainer: {
    marginBottom: 24,
    padding: 16,
  },
  languageStat: {
    marginBottom: 16,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  wordsLearned: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItemSmall: {
    flex: 1,
    alignItems: 'center',
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabelSmall: {
    fontSize: 12,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  dangerSettingItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    marginRight: 8,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  goalSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  goalSuggestion: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalSuggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageList: {
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  languageItemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageItemName: {
    flex: 1,
    fontSize: 16,
  },
  languageItemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});