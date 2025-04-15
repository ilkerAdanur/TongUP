import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Exercise } from '@/types';
import { mockExercises } from '@/mocks/exercises';
import { useUserStore } from './user-store';
import { Alert } from 'react-native';

interface ExercisesState {
  completedExercises: Record<string, boolean>;
  exerciseResults: Record<string, boolean>;
  customExercises: Exercise[];
  getExercisesByLanguageAndLevel: (languageId: string, level: string, type?: string) => Exercise[];
  markExerciseCompleted: (exerciseId: string, isCorrect: boolean) => void;
  isExerciseCompleted: (exerciseId: string) => boolean;
  getExerciseResult: (exerciseId: string) => boolean | undefined;
  getCompletedExercisesCount: (languageId: string) => number;
  getSuccessRate: (languageId: string) => number;
  resetProgress: (languageId: string, level: string) => void;
  addExercise: (exercise: Exercise) => void;
}

export const useExercisesStore = create<ExercisesState>()(
  persist(
    (set, get) => ({
      completedExercises: {},
      exerciseResults: {},
      customExercises: [],
      
      getExercisesByLanguageAndLevel: (languageId, level, type) => {
        const key = `${languageId}-${level}`;
        const exercises = mockExercises[key] || [];
        const customExercises = get().customExercises.filter(
          ex => ex.languageId === languageId && ex.proficiencyLevel === level
        );
        
        const allExercises = [...exercises, ...customExercises];
        
        if (type) {
          return allExercises.filter(ex => ex.type === type);
        }
        
        return allExercises;
      },
      
      markExerciseCompleted: (exerciseId, isCorrect) => set((state) => {
        // Get exercise details to update language stats
        let exercise: Exercise | undefined;
        Object.values(mockExercises).forEach(exList => {
          const found = exList.find(ex => ex.id === exerciseId);
          if (found) exercise = found;
        });
        
        if (!exercise) {
          exercise = state.customExercises.find(ex => ex.id === exerciseId);
        }
        
        if (exercise) {
          const { updateLanguageStat, unlockAchievement } = useUserStore.getState();
          const stats = useUserStore.getState().languageStats.find(s => s.languageId === exercise?.languageId);
          
          if (stats) {
            const newExercisesCompleted = stats.exercisesCompleted + 1;
            
            // Calculate new success rate
            const completedCount = Object.keys(state.completedExercises).length;
            const successCount = Object.values(state.exerciseResults).filter(Boolean).length + (isCorrect ? 1 : 0);
            const newSuccessRate = completedCount > 0 ? successCount / (completedCount + 1) : isCorrect ? 1 : 0;
            
            updateLanguageStat(exercise.languageId, {
              exercisesCompleted: newExercisesCompleted,
              successRate: newSuccessRate,
            });
            
            // Check for perfect score achievement
            if (isCorrect) {
              // Check if all exercises of this type for this language/level are correct
              const exercisesOfType = get().getExercisesByLanguageAndLevel(
                exercise.languageId, 
                exercise.proficiencyLevel, 
                exercise.type
              );
              
              const allCompleted = exercisesOfType.every(ex => 
                ex.id === exerciseId || state.exerciseResults[ex.id] === true
              );
              
              if (allCompleted && exercisesOfType.length > 1) {
                unlockAchievement('perfect-score');
              }
            }
          }
        }
        
        return {
          completedExercises: {
            ...state.completedExercises,
            [exerciseId]: true,
          },
          exerciseResults: {
            ...state.exerciseResults,
            [exerciseId]: isCorrect,
          },
        };
      }),
      
      isExerciseCompleted: (exerciseId) => {
        return !!get().completedExercises[exerciseId];
      },
      
      getExerciseResult: (exerciseId) => {
        return get().exerciseResults[exerciseId];
      },
      
      getCompletedExercisesCount: (languageId) => {
        let count = 0;
        
        Object.keys(get().completedExercises).forEach(exerciseId => {
          // Extract language from exercise ID (format: type-lang-level-number)
          const parts = exerciseId.split('-');
          if (parts.length >= 3 && parts[1] === languageId) {
            count++;
          }
        });
        
        return count;
      },
      
      getSuccessRate: (languageId) => {
        let completed = 0;
        let correct = 0;
        
        Object.entries(get().exerciseResults).forEach(([exerciseId, result]) => {
          const parts = exerciseId.split('-');
          if (parts.length >= 3 && parts[1] === languageId) {
            completed++;
            if (result) correct++;
          }
        });
        
        return completed > 0 ? correct / completed : 0;
      },
      
      resetProgress: (languageId, level) => set((state) => {
        const newCompletedExercises = { ...state.completedExercises };
        const newExerciseResults = { ...state.exerciseResults };
        
        // Remove all exercises for the specified language and level
        Object.keys(newCompletedExercises).forEach(exerciseId => {
          const parts = exerciseId.split('-');
          if (parts.length >= 4 && parts[1] === languageId && parts[2] === level.toLowerCase()) {
            delete newCompletedExercises[exerciseId];
            delete newExerciseResults[exerciseId];
          }
        });
        
        return {
          completedExercises: newCompletedExercises,
          exerciseResults: newExerciseResults,
        };
      }),
      
      // Implementation for addExercise function
      addExercise: (exercise: Exercise) => set((state) => {
        const newExercises = [...state.customExercises, exercise];
        Alert.alert('Success', 'Exercise added successfully');
        return { customExercises: newExercises };
      })
    }),
    {
      name: 'vocabuddy-exercises-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);