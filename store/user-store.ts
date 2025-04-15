import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import { auth } from '@/config/firebase';
import achievements from '@/mocks/achievements';

export interface LanguageStat {
  languageId: string;
  wordsLearned: number;
  exercisesCompleted: number;
  gamesPlayed: number;
  successRate: number;
}

export interface Profile {
  name: string;
  email?: string;
  profilePicture?: string;
  selectedLanguages: string[];
  dailyWordGoal?: number;
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
    progress: number;
    maxProgress: number;
  }[];
}

interface UserState {
  profile: Profile;
  currentLanguage: string;
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  languageStats: LanguageStat[];
  updateProfile: (updates: Partial<Profile>) => void;
  setCurrentLanguage: (languageId: string) => void;
  setCurrentLevel: (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') => void;
  toggleLanguageSelection: (languageId: string) => void;
  updateLanguageStat: (languageId: string, updates: Partial<Omit<LanguageStat, 'languageId'>>) => void;
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  resetProgress: () => void;
  syncWithFirestore: () => Promise<void>;
}

// Initialize with default values
const defaultProfile: Profile = {
  name: 'Kullanıcı',
  email: '',
  profilePicture: undefined,
  selectedLanguages: ['en', 'fr', 'de', 'es', 'it'], // All languages selected by default
  dailyWordGoal: 10,
  achievements: achievements || [],
};

// Default language stats
const defaultLanguageStats: LanguageStat[] = [
  {
    languageId: 'en',
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  },
  {
    languageId: 'fr',
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  },
  {
    languageId: 'de',
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  },
  {
    languageId: 'es',
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  },
  {
    languageId: 'it',
    wordsLearned: 0,
    exercisesCompleted: 0,
    gamesPlayed: 0,
    successRate: 0,
  },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      currentLanguage: 'en',
      currentLevel: 'A1',
      languageStats: defaultLanguageStats,
      
      updateProfile: (updates) => {
        set((state) => {
          const updatedProfile = { ...state.profile, ...updates };
          
          // Sync with Firestore if user is authenticated
          const userId = auth.currentUser?.uid;
          if (userId) {
            const userStatsRef = doc(firestore, 'userStats', userId);
            updateDoc(userStatsRef, { profile: updatedProfile }).catch(error => {
              console.error('Error updating profile in Firestore:', error);
            });
          }
          
          return { profile: updatedProfile };
        });
      },
      
      setCurrentLanguage: (languageId) => {
        set({ currentLanguage: languageId });
      },
      
      setCurrentLevel: (level) => {
        set({ currentLevel: level });
      },
      
      toggleLanguageSelection: (languageId) => set((state) => {
        if (!state.profile) {
          return { profile: defaultProfile };
        }
        
        const isSelected = state.profile.selectedLanguages.includes(languageId);
        
        // If English is being deselected and it's the only language, don't allow it
        if (languageId === 'en' && isSelected && state.profile.selectedLanguages.length === 1) {
          return state;
        }
        
        let newSelectedLanguages;
        if (isSelected) {
          // Remove language
          newSelectedLanguages = state.profile.selectedLanguages.filter(id => id !== languageId);
          
          // If removing the current language, switch to the first available language
          if (state.currentLanguage === languageId) {
            set({ currentLanguage: newSelectedLanguages[0] });
          }
        } else {
          // Add language
          newSelectedLanguages = [...state.profile.selectedLanguages, languageId];
          
          // Also add a language stat if it doesn't exist
          if (!state.languageStats.some(stat => stat.languageId === languageId)) {
            set((state) => ({
              languageStats: [
                ...state.languageStats,
                {
                  languageId,
                  wordsLearned: 0,
                  exercisesCompleted: 0,
                  gamesPlayed: 0,
                  successRate: 0,
                },
              ],
            }));
          }
        }
        
        const updatedProfile = {
          ...state.profile,
          selectedLanguages: newSelectedLanguages,
        };
        
        // Sync with Firestore if user is authenticated
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userStatsRef = doc(firestore, 'userStats', userId);
          updateDoc(userStatsRef, { 
            'profile.selectedLanguages': newSelectedLanguages 
          }).catch(error => {
            console.error('Error updating selected languages in Firestore:', error);
          });
        }
        
        return { profile: updatedProfile };
      }),
      
      updateLanguageStat: (languageId, updates) => set((state) => {
        const statIndex = state.languageStats.findIndex(stat => stat.languageId === languageId);
        
        let updatedStats;
        if (statIndex === -1) {
          // If stat doesn't exist, create it
          updatedStats = [
            ...state.languageStats,
            {
              languageId,
              wordsLearned: updates.wordsLearned || 0,
              exercisesCompleted: updates.exercisesCompleted || 0,
              gamesPlayed: updates.gamesPlayed || 0,
              successRate: updates.successRate || 0,
            },
          ];
        } else {
          // Update existing stat
          updatedStats = [...state.languageStats];
          updatedStats[statIndex] = {
            ...updatedStats[statIndex],
            ...updates,
          };
        }
        
        // Sync with Firestore if user is authenticated
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userStatsRef = doc(firestore, 'userStats', userId);
          updateDoc(userStatsRef, { languageStats: updatedStats }).catch(error => {
            console.error('Error updating language stats in Firestore:', error);
          });
        }
        
        return { languageStats: updatedStats };
      }),
      
      unlockAchievement: (achievementId) => set((state) => {
        if (!state.profile || !state.profile.achievements) {
          return state;
        }
        
        const achievementIndex = state.profile.achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) return state;
        
        const updatedAchievements = [...state.profile.achievements];
        updatedAchievements[achievementIndex] = {
          ...updatedAchievements[achievementIndex],
          isUnlocked: true,
          progress: updatedAchievements[achievementIndex].maxProgress,
        };
        
        const updatedProfile = {
          ...state.profile,
          achievements: updatedAchievements,
        };
        
        // Sync with Firestore if user is authenticated
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userStatsRef = doc(firestore, 'userStats', userId);
          updateDoc(userStatsRef, { 
            'profile.achievements': updatedAchievements 
          }).catch(error => {
            console.error('Error updating achievements in Firestore:', error);
          });
        }
        
        return { profile: updatedProfile };
      }),
      
      updateAchievementProgress: (achievementId, progress) => set((state) => {
        if (!state.profile || !state.profile.achievements) {
          return state;
        }
        
        const achievementIndex = state.profile.achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) return state;
        
        const achievement = state.profile.achievements[achievementIndex];
        const newProgress = Math.min(achievement.maxProgress, progress);
        const isUnlocked = newProgress >= achievement.maxProgress;
        
        const updatedAchievements = [...state.profile.achievements];
        updatedAchievements[achievementIndex] = {
          ...achievement,
          progress: newProgress,
          isUnlocked: isUnlocked || achievement.isUnlocked,
        };
        
        const updatedProfile = {
          ...state.profile,
          achievements: updatedAchievements,
        };
        
        // Sync with Firestore if user is authenticated
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userStatsRef = doc(firestore, 'userStats', userId);
          updateDoc(userStatsRef, { 
            'profile.achievements': updatedAchievements 
          }).catch(error => {
            console.error('Error updating achievement progress in Firestore:', error);
          });
        }
        
        return { profile: updatedProfile };
      }),
      
      resetProgress: () => set((state) => {
        // Reset achievements
        const resetAchievements = state.profile.achievements.map(achievement => ({
          ...achievement,
          isUnlocked: false,
          progress: 0,
        }));
        
        // Reset language stats
        const resetLanguageStats = state.languageStats.map(stat => ({
          ...stat,
          wordsLearned: 0,
          exercisesCompleted: 0,
          gamesPlayed: 0,
          successRate: 0,
        }));
        
        const updatedProfile = {
          ...state.profile,
          achievements: resetAchievements,
        };
        
        // Sync with Firestore if user is authenticated
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userStatsRef = doc(firestore, 'userStats', userId);
          updateDoc(userStatsRef, { 
            profile: updatedProfile,
            languageStats: resetLanguageStats,
            currentLevel: 'A1'
          }).catch(error => {
            console.error('Error resetting progress in Firestore:', error);
          });
        }
        
        return {
          profile: updatedProfile,
          languageStats: resetLanguageStats,
          currentLevel: 'A1',
        };
      }),
      
      syncWithFirestore: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          const userStatsRef = doc(firestore, 'userStats', userId);
          const userStatsDoc = await getDoc(userStatsRef);
          
          if (userStatsDoc.exists()) {
            // Update local state with Firestore data
            const data = userStatsDoc.data();
            set({
              profile: data.profile || defaultProfile,
              languageStats: data.languageStats || defaultLanguageStats,
              currentLanguage: data.currentLanguage || 'en',
              currentLevel: data.currentLevel || 'A1',
            });
          } else {
            // Create new document in Firestore with current state
            const state = get();
            await setDoc(userStatsRef, {
              userId,
              profile: state.profile,
              languageStats: state.languageStats,
              currentLanguage: state.currentLanguage,
              currentLevel: state.currentLevel,
              dailyStreak: 0,
              totalXP: 0,
              completedTests: 0,
            });
          }
        } catch (error) {
          console.error('Error syncing with Firestore:', error);
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Sync with Firestore when auth state changes
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      useUserStore.getState().syncWithFirestore();
    }
  });
}