export interface User {
  id: string;
  username: string;
  email: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: string;
  points: number;
  streak: number;
  lastActive: string;
  joinDate: string;
  achievements: Achievement[];
  friends?: string[];
  settings?: UserSettings;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  sound: boolean;
}

export interface Word {
  id: string;
  word: string;
  translation: string;
  language: string;
  examples?: string[];
  notes?: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  reviewCount?: number;
  mastered?: boolean;
}

export interface Exercise {
  id: string;
  type: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeEstimate: string;
  completed: boolean;
  language: string;
}

export interface Game {
  id: string;
  type: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  timeEstimate: string;
  completed: boolean;
  language: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  dateCompleted?: string;
  reward?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  reminderTime?: string;
  isCompleted: boolean;
}

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  level: string;
  points: number;
  streak: number;
  lastActive: string;
  status: 'online' | 'offline' | 'away';
}

export interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  sender: string;
  receiver: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  createdAt: string;
  expiresAt: string;
  result?: {
    winnerId: string;
    senderScore: number;
    receiverScore: number;
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

export interface AIResponse {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  language: string;
}

export interface Stats {
  wordsLearned: number;
  exercisesCompleted: number;
  gamesPlayed: number;
  pointsEarned: number;
  streakDays: number;
  studyTimeMinutes: number;
  masteredWords: number;
}

export interface LanguageStats {
  language: string;
  wordsLearned: number;
  masteredWords: number;
  exercisesCompleted: number;
  studyTimeMinutes: number;
}

export interface DailyGoal {
  id: string;
  type: 'words' | 'exercises' | 'time' | 'points';
  target: number;
  current: number;
  completed: boolean;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  activity: 'words' | 'exercises' | 'games' | 'conversation';
  points: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'friend' | 'challenge' | 'system';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}