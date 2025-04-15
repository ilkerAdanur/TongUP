import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useUserStore } from './user-store';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
          };
          
          set({ user, isAuthenticated: true });
          
          // Update user profile in user store
          const { updateProfile } = useUserStore.getState();
          updateProfile({
            name: user.name,
            email: user.email,
            profilePicture: user.photoURL,
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      googleLogin: async (idToken: string) => {
        try {
          const credential = GoogleAuthProvider.credential(idToken);
          const userCredential = await signInWithCredential(auth, credential);
          const firebaseUser = userCredential.user;
          
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
          };
          
          set({ user, isAuthenticated: true });
          
          // Update user profile in user store
          const { updateProfile } = useUserStore.getState();
          updateProfile({
            name: user.name,
            email: user.email,
            profilePicture: user.photoURL,
          });
          
          return true;
        } catch (error) {
          console.error('Google login error:', error);
          return false;
        }
      },

      signup: async (name: string, email: string, password: string) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Update the user's profile with their name
          await updateProfile(firebaseUser, {
            displayName: name,
          });
          
          // Don't automatically log in the user
          // Instead, redirect to login page
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await signOut(auth);
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      forgotPassword: async (email: string) => {
        try {
          await sendPasswordResetEmail(auth, email);
          return true;
        } catch (error) {
          console.error('Password reset error:', error);
          return false;
        }
      },

      updateUserProfile: async (name: string, photoURL?: string) => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) return false;
          
          await updateProfile(currentUser, {
            displayName: name,
            photoURL: photoURL,
          });
          
          const updatedUser: User = {
            id: currentUser.uid,
            name: name,
            email: currentUser.email || '',
            photoURL: photoURL,
          };
          
          set({ user: updatedUser });
          
          // Update user profile in user store
          const { updateProfile } = useUserStore.getState();
          updateProfile({
            name: name,
            profilePicture: photoURL,
          });
          
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up auth state listener
if (auth) {
  onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || undefined,
      };
      
      useAuthStore.setState({ 
        user, 
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Update user profile in user store
      const { updateProfile } = useUserStore.getState();
      updateProfile({
        name: user.name,
        email: user.email,
        profilePicture: user.photoURL,
      });
    } else {
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
      });
    }
  });
}