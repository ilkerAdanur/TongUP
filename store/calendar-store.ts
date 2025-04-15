import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CalendarEvent } from '@/types';
import { useUserStore } from './user-store';

interface CalendarState {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'isCompleted'>) => CalendarEvent | null;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  markEventCompleted: (id: string, isCompleted: boolean) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  getUpcomingEvents: (count?: number) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (eventData) => {
        try {
          // Ensure we have valid date fields
          if (!eventData.startDate) {
            console.error('Error: startDate is required for calendar events');
            return null;
          }
          
          const newEvent: CalendarEvent = {
            id: Date.now().toString(),
            ...eventData,
            isCompleted: false,
          };
          
          set((state) => ({ 
            events: [...state.events, newEvent] 
          }));
          
          return newEvent;
        } catch (error) {
          console.error('Error adding event:', error);
          return null;
        }
      },
      
      updateEvent: (id, updates) => {
        try {
          set((state) => ({
            events: state.events.map(event => 
              event.id === id ? { ...event, ...updates } : event
            ),
          }));
        } catch (error) {
          console.error('Error updating event:', error);
        }
      },
      
      deleteEvent: (id) => {
        try {
          set((state) => ({
            events: state.events.filter(event => event.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting event:', error);
        }
      },
      
      markEventCompleted: (id, isCompleted) => {
        try {
          set((state) => {
            const events = state.events.map(event => 
              event.id === id ? { ...event, isCompleted } : event
            );
            
            // Check for consistent learner achievement
            if (isCompleted) {
              const { updateAchievementProgress } = useUserStore.getState();
              
              // Get completed events for the last 7 days
              const now = new Date();
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(now.getDate() - 7);
              
              const completedDates = new Set();
              events.forEach(event => {
                if (event.isCompleted && event.startDate) {
                  try {
                    const eventDate = new Date(event.startDate);
                    if (eventDate >= oneWeekAgo && eventDate <= now) {
                      completedDates.add(event.startDate.split('T')[0]); // Add just the date part
                    }
                  } catch (error) {
                    console.error('Error processing event date:', error);
                  }
                }
              });
              
              updateAchievementProgress('consistent-learner', completedDates.size);
            }
            
            return { events };
          });
        } catch (error) {
          console.error('Error marking event completed:', error);
        }
      },
      
      getEventsByDate: (date) => {
        try {
          if (!date) {
            console.error('Error: date parameter is required for getEventsByDate');
            return [];
          }
          
          // Match events by date part only (ignore time)
          return get().events.filter(event => {
            if (!event.startDate) return false;
            
            try {
              const eventDate = new Date(event.startDate);
              const eventDateString = eventDate.toISOString().split('T')[0];
              return eventDateString === date;
            } catch (error) {
              console.error('Error comparing event dates:', error);
              return false;
            }
          });
        } catch (error) {
          console.error('Error getting events by date:', error);
          return [];
        }
      },
      
      getUpcomingEvents: (count = 5) => {
        try {
          const now = new Date();
          return get().events
            .filter(event => {
              if (!event.startDate) return false;
              try {
                return !event.isCompleted && new Date(event.startDate) >= now;
              } catch (error) {
                console.error('Error filtering upcoming events:', error);
                return false;
              }
            })
            .sort((a, b) => {
              try {
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
              } catch (error) {
                console.error('Error sorting upcoming events:', error);
                return 0;
              }
            })
            .slice(0, count);
        } catch (error) {
          console.error('Error getting upcoming events:', error);
          return [];
        }
      },
    }),
    {
      name: 'vocabuddy-calendar-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);