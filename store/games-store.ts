import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameResult } from '@/types';
import { useUserStore } from './user-store';

interface GamesState {
  results: GameResult[];
  addResult: (result: Omit<GameResult, 'id' | 'date'>) => void;
  recordGameResult: (result: Omit<GameResult, 'id'>) => void;
  getResultsByLanguage: (languageId: string) => GameResult[];
  getResultsByGame: (gameType: string) => GameResult[];
  getAverageScoreByLanguage: (languageId: string) => number;
  getAverageScoreByGame: (gameType: string) => number;
  getTotalGamesPlayed: (gameType?: string) => number;
}

export const useGamesStore = create<GamesState>()(
  persist(
    (set, get) => ({
      results: [],
      
      addResult: (resultData) => set((state) => {
        const newResult: GameResult = {
          id: Date.now().toString(),
          ...resultData,
          date: Date.now(),
        };
        
        // Update user stats
        const { updateLanguageStat, updateAchievementProgress } = useUserStore.getState();
        const stats = useUserStore.getState().languageStats.find(s => s.languageId === resultData.languageId);
        
        if (stats) {
          updateLanguageStat(resultData.languageId, {
            gamesPlayed: stats.gamesPlayed + 1,
          });
        }
        
        // Check for game champion achievement
        updateAchievementProgress('game-champion', 1);
        
        return { results: [...state.results, newResult] };
      }),
      
      recordGameResult: (resultData) => set((state) => {
        const newResult: GameResult = {
          id: Date.now().toString(),
          ...resultData,
        };
        
        // Update user stats
        const { updateLanguageStat, updateAchievementProgress } = useUserStore.getState();
        const stats = useUserStore.getState().languageStats.find(s => s.languageId === resultData.languageId);
        
        if (stats) {
          updateLanguageStat(resultData.languageId, {
            gamesPlayed: stats.gamesPlayed + 1,
          });
        }
        
        // Check for game champion achievement
        updateAchievementProgress('game-champion', 1);
        
        return { results: [...state.results, newResult] };
      }),
      
      getResultsByLanguage: (languageId) => {
        return get().results.filter(result => result.languageId === languageId);
      },
      
      getResultsByGame: (gameType) => {
        return get().results.filter(result => result.gameType === gameType);
      },
      
      getAverageScoreByLanguage: (languageId) => {
        const results = get().getResultsByLanguage(languageId);
        if (results.length === 0) return 0;
        
        const totalScore = results.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0);
        return totalScore / results.length;
      },
      
      getAverageScoreByGame: (gameType) => {
        const results = get().getResultsByGame(gameType);
        if (results.length === 0) return 0;
        
        const totalScore = results.reduce((sum, result) => sum + (result.score / result.totalQuestions), 0);
        return totalScore / results.length;
      },
      
      getTotalGamesPlayed: (gameType) => {
        if (gameType) {
          return get().results.filter(result => result.gameType === gameType).length;
        }
        return get().results.length;
      },
    }),
    {
      name: 'vocabuddy-games-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);