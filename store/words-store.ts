import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Word } from '@/types';
import { useUserStore } from './user-store';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { firestore, auth } from '@/config/firebase';

interface WordsState {
  words: Word[];
  isLoading: boolean;
  addWord: (word: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'successRate'>) => Promise<void>;
  updateWord: (id: string, updates: Partial<Word>) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
  reviewWord: (id: string, isCorrect: boolean) => Promise<void>;
  getWordsByLanguage: (languageId: string) => Word[];
  getWordsByLanguageAndLevel: (languageId: string, level: string) => Word[];
  searchWords: (query: string, languageId: string) => Word[];
  getLearnedWordsCount: (languageId: string) => number;
  fetchWords: () => Promise<void>;
}

export const useWordsStore = create<WordsState>()(
  persist(
    (set, get) => ({
      words: [],
      isLoading: false,
      
      fetchWords: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          set({ isLoading: true });
          
          // Get all word lists for the current user
          const wordListsRef = collection(firestore, 'wordLists');
          const wordListsQuery = query(wordListsRef, where('userId', '==', userId));
          const wordListsSnapshot = await getDocs(wordListsQuery);
          
          const fetchedWords: Word[] = [];
          
          // For each word list, get its words
          for (const listDoc of wordListsSnapshot.docs) {
            const listId = listDoc.id;
            const wordsRef = collection(firestore, `wordLists/${listId}/words`);
            const wordsSnapshot = await getDocs(wordsRef);
            
            wordsSnapshot.forEach(wordDoc => {
              const wordData = wordDoc.data();
              
              // Convert Firestore timestamp to JS Date
              let createdAt = Date.now();
              let lastReviewedAt = undefined;
              
              if (wordData.createdAt instanceof Timestamp) {
                createdAt = wordData.createdAt.toMillis();
              }
              
              if (wordData.lastReviewedAt instanceof Timestamp) {
                lastReviewedAt = wordData.lastReviewedAt.toMillis();
              }
              
              fetchedWords.push({
                id: wordDoc.id,
                word: wordData.word,
                translation: wordData.meaning,
                context: wordData.context,
                languageId: wordData.languageId,
                proficiencyLevel: wordData.proficiencyLevel,
                isLearned: wordData.isLearned || false,
                createdAt,
                lastReviewedAt,
                reviewCount: wordData.reviewCount || 0,
                successRate: wordData.successRate || 0,
                imageUrl: wordData.imageUrl,
                audioUrl: wordData.audioUrl,
              });
            });
          }
          
          set({ words: fetchedWords, isLoading: false });
        } catch (error) {
          console.error('Error fetching words:', error);
          set({ isLoading: false });
        }
      },
      
      addWord: async (wordData) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          set({ isLoading: true });
          
          // Find or create a word list for this language
          const wordListsRef = collection(firestore, 'wordLists');
          const wordListsQuery = query(
            wordListsRef, 
            where('userId', '==', userId),
            where('language', '==', wordData.languageId)
          );
          const wordListsSnapshot = await getDocs(wordListsQuery);
          
          let listId;
          
          if (wordListsSnapshot.empty) {
            // Create a new word list for this language
            const newListRef = await addDoc(wordListsRef, {
              userId,
              title: `${wordData.languageId.toUpperCase()} Word List`,
              description: `Words for ${wordData.languageId} language`,
              language: wordData.languageId,
              createdAt: serverTimestamp(),
              progress: 0,
            });
            
            listId = newListRef.id;
          } else {
            // Use the first existing list
            listId = wordListsSnapshot.docs[0].id;
          }
          
          // Add the word to the list's words subcollection
          const wordsRef = collection(firestore, `wordLists/${listId}/words`);
          const newWordRef = await addDoc(wordsRef, {
            word: wordData.word,
            meaning: wordData.translation,
            context: wordData.context || '',
            languageId: wordData.languageId,
            proficiencyLevel: wordData.proficiencyLevel,
            isLearned: wordData.isLearned || false,
            createdAt: serverTimestamp(),
            reviewCount: 0,
            successRate: 0,
            imageUrl: wordData.imageUrl || '',
            audioUrl: wordData.audioUrl || '',
          });
          
          const newWord: Word = {
            id: newWordRef.id,
            ...wordData,
            createdAt: Date.now(),
            reviewCount: 0,
            successRate: 0,
          };
          
          // Update user stats
          const { updateLanguageStat, unlockAchievement, updateAchievementProgress } = useUserStore.getState();
          const stats = useUserStore.getState().languageStats.find(s => s.languageId === wordData.languageId);
          
          if (stats) {
            updateLanguageStat(wordData.languageId, {
              wordsLearned: stats.wordsLearned + 1,
            });
          }
          
          // Check for first word achievement
          const wordsCount = get().words.filter(w => w.languageId === wordData.languageId).length;
          if (wordsCount === 0) {
            unlockAchievement('first-word');
          }
          
          // Check for vocabulary builder achievement
          const totalWords = get().words.length + 1;
          updateAchievementProgress('vocabulary-builder', totalWords);
          
          set(state => ({ 
            words: [...state.words, newWord],
            isLoading: false
          }));
        } catch (error) {
          console.error('Error adding word:', error);
          set({ isLoading: false });
        }
      },
      
      updateWord: async (id, updates) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          set({ isLoading: true });
          
          // Find the word in the local state
          const word = get().words.find(w => w.id === id);
          if (!word) {
            set({ isLoading: false });
            return;
          }
          
          // Find the word list that contains this word
          const wordListsRef = collection(firestore, 'wordLists');
          const wordListsQuery = query(
            wordListsRef, 
            where('userId', '==', userId),
            where('language', '==', word.languageId)
          );
          const wordListsSnapshot = await getDocs(wordListsQuery);
          
          if (wordListsSnapshot.empty) {
            set({ isLoading: false });
            return;
          }
          
          // Update the word in Firestore
          const listId = wordListsSnapshot.docs[0].id;
          const wordRef = doc(firestore, `wordLists/${listId}/words/${id}`);
          
          // Convert the updates to Firestore format
          const firestoreUpdates: any = {};
          
          if (updates.word) firestoreUpdates.word = updates.word;
          if (updates.translation) firestoreUpdates.meaning = updates.translation;
          if (updates.context) firestoreUpdates.context = updates.context;
          if (updates.proficiencyLevel) firestoreUpdates.proficiencyLevel = updates.proficiencyLevel;
          if (updates.isLearned !== undefined) firestoreUpdates.isLearned = updates.isLearned;
          if (updates.imageUrl) firestoreUpdates.imageUrl = updates.imageUrl;
          if (updates.audioUrl) firestoreUpdates.audioUrl = updates.audioUrl;
          
          await updateDoc(wordRef, firestoreUpdates);
          
          // Update the word in local state
          set(state => ({
            words: state.words.map(word => 
              word.id === id ? { ...word, ...updates } : word
            ),
            isLoading: false
          }));
        } catch (error) {
          console.error('Error updating word:', error);
          set({ isLoading: false });
        }
      },
      
      deleteWord: async (id) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          set({ isLoading: true });
          
          // Find the word in the local state
          const word = get().words.find(w => w.id === id);
          if (!word) {
            set({ isLoading: false });
            return;
          }
          
          // Find the word list that contains this word
          const wordListsRef = collection(firestore, 'wordLists');
          const wordListsQuery = query(
            wordListsRef, 
            where('userId', '==', userId),
            where('language', '==', word.languageId)
          );
          const wordListsSnapshot = await getDocs(wordListsQuery);
          
          if (wordListsSnapshot.empty) {
            set({ isLoading: false });
            return;
          }
          
          // Delete the word from Firestore
          const listId = wordListsSnapshot.docs[0].id;
          const wordRef = doc(firestore, `wordLists/${listId}/words/${id}`);
          await deleteDoc(wordRef);
          
          // Delete the word from local state
          set(state => ({
            words: state.words.filter(word => word.id !== id),
            isLoading: false
          }));
        } catch (error) {
          console.error('Error deleting word:', error);
          set({ isLoading: false });
        }
      },
      
      reviewWord: async (id, isCorrect) => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        try {
          set({ isLoading: true });
          
          // Find the word in the local state
          const word = get().words.find(w => w.id === id);
          if (!word) {
            set({ isLoading: false });
            return;
          }
          
          // Calculate new review stats
          const newReviewCount = word.reviewCount + 1;
          const newSuccessCount = isCorrect ? 
            (word.successRate * word.reviewCount) + 1 : 
            (word.successRate * word.reviewCount);
          const newSuccessRate = newSuccessCount / newReviewCount;
          
          // Find the word list that contains this word
          const wordListsRef = collection(firestore, 'wordLists');
          const wordListsQuery = query(
            wordListsRef, 
            where('userId', '==', userId),
            where('language', '==', word.languageId)
          );
          const wordListsSnapshot = await getDocs(wordListsQuery);
          
          if (wordListsSnapshot.empty) {
            set({ isLoading: false });
            return;
          }
          
          // Update the word in Firestore
          const listId = wordListsSnapshot.docs[0].id;
          const wordRef = doc(firestore, `wordLists/${listId}/words/${id}`);
          
          await updateDoc(wordRef, {
            reviewCount: newReviewCount,
            successRate: newSuccessRate,
            lastReviewedAt: serverTimestamp(),
          });
          
          // Update the word in local state
          set(state => {
            const words = [...state.words];
            const index = words.findIndex(w => w.id === id);
            
            if (index !== -1) {
              words[index] = {
                ...words[index],
                reviewCount: newReviewCount,
                successRate: newSuccessRate,
                lastReviewedAt: Date.now(),
              };
            }
            
            return { words, isLoading: false };
          });
        } catch (error) {
          console.error('Error reviewing word:', error);
          set({ isLoading: false });
        }
      },
      
      getWordsByLanguage: (languageId) => {
        return get().words.filter(word => word.languageId === languageId);
      },
      
      getWordsByLanguageAndLevel: (languageId, level) => {
        return get().words.filter(
          word => word.languageId === languageId && word.proficiencyLevel === level
        );
      },
      
      searchWords: (query, languageId) => {
        const lowerQuery = query.toLowerCase();
        return get().words.filter(
          word => word.languageId === languageId && 
            (word.word.toLowerCase().includes(lowerQuery) || 
             word.translation.toLowerCase().includes(lowerQuery))
        );
      },
      
      getLearnedWordsCount: (languageId) => {
        return get().words.filter(
          word => word.languageId === languageId && word.isLearned === true
        ).length;
      },
    }),
    {
      name: 'vocabuddy-words-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ words: state.words }),
    }
  )
);

// Fetch words when auth state changes
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      useWordsStore.getState().fetchWords();
    }
  });
}