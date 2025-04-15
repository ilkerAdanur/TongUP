import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { CalendarEventItem } from '@/components/CalendarEventItem';
import { Button } from '@/components/Button';
import { useCalendarStore } from '@/store/calendar-store';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarEvent } from '@/types';

export default function CalendarScreen() {
  const router = useRouter();
  const { events, getEventsByDate } = useCalendarStore();
  const { colors, isDark } = useTheme();
  
  // Get today's date in YYYY-MM-DD format
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.substring(0, 7));
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<CalendarEvent[]>([]);
  
  useEffect(() => {
    if (selectedDate) {
      const filteredEvents = getEventsByDate(selectedDate);
      setEventsForSelectedDate(filteredEvents);
    }
  }, [selectedDate, events]);
  
  const handleAddEvent = () => {
    router.push(`/calendar/add?date=${selectedDate}`);
  };
  
  const handleEditEvent = (id: string) => {
    router.push(`/calendar/edit/${id}`);
  };
  
  // Generate marked dates for the calendar
  const markedDates: any = {};
  
  // Mark the selected date
  if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: 'rgba(255, 255, 255, 0.3)',
      customContainerStyle: {
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 20,
      },
    };
  }
  
  // Mark dates with events
  events.forEach(event => {
    if (!event.startDate) return; // Skip events without a startDate
    
    try {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      
      if (eventDate === selectedDate) {
        // If it's the selected date, merge with existing selected style
        markedDates[eventDate] = {
          ...markedDates[eventDate],
          selected: true,
          selectedColor: 'rgba(255, 255, 255, 0.3)',
          marked: true,
          dotColor: 'white',
          customContainerStyle: {
            borderWidth: 2,
            borderColor: 'white',
            borderRadius: 20,
          },
        };
      } else if (markedDates[eventDate]) {
        // If the date is already in markedDates, just add the dot
        markedDates[eventDate] = {
          ...markedDates[eventDate],
          marked: true,
          dotColor: 'white',
        };
      } else {
        // Otherwise, create a new entry
        markedDates[eventDate] = {
          marked: true,
          dotColor: 'white',
        };
      }
    } catch (error) {
      console.error('Error processing event date:', error, event);
    }
  });
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textLight }]}>
        Bu tarih için etkinlik bulunmamaktadır.
      </Text>
      <Button
        title="Etkinlik Ekle"
        onPress={handleAddEvent}
        icon={<Plus size={18} color="white" />}
        style={styles.addButton}
      />
    </View>
  );
  
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const getMonthName = (dateString: string) => {
    try {
      const [year, month] = dateString.split('-');
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } catch (error) {
      console.error('Error getting month name:', error);
      return 'Geçersiz Tarih';
    }
  };

  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-');
    const prevMonth = parseInt(month) - 1;
    
    if (prevMonth === 0) {
      // If current month is January, go to December of previous year
      setCurrentMonth(`${parseInt(year) - 1}-12`);
    } else {
      // Otherwise, go to previous month of same year
      setCurrentMonth(`${year}-${String(prevMonth).padStart(2, '0')}`);
    }
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-');
    const nextMonth = parseInt(month) + 1;
    
    if (nextMonth === 13) {
      // If current month is December, go to January of next year
      setCurrentMonth(`${parseInt(year) + 1}-01`);
    } else {
      // Otherwise, go to next month of same year
      setCurrentMonth(`${year}-${String(nextMonth).padStart(2, '0')}`);
    }
  };
  
  // Calendar theme - purple background in both light and dark modes
  const calendarTheme = {
    backgroundColor: '#8A2BE2', // Purple background
    calendarBackground: '#8A2BE2',
    textSectionTitleColor: 'white',
    selectedDayBackgroundColor: 'rgba(255, 255, 255, 0.3)',
    selectedDayTextColor: 'white',
    todayTextColor: '#FFD700', // Gold color for today
    dayTextColor: 'white',
    textDisabledColor: 'rgba(255, 255, 255, 0.5)',
    dotColor: 'white',
    selectedDotColor: 'white',
    arrowColor: 'white',
    monthTextColor: 'white',
    indicatorColor: 'white',
    textDayFontWeight: '400',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '500',
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.arrowButton}>
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {getMonthName(currentMonth)}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <RNCalendar
          current={currentMonth}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          onMonthChange={(month: DateData) => {
            if (month && month.dateString) {
              setCurrentMonth(month.dateString.substring(0, 7));
            }
          }}
          hideExtraDays={true}
          firstDay={1}
          enableSwipeMonths={true}
          hideArrows={true}
          renderHeader={() => null} // Hide default header
          theme={calendarTheme}
        />
      </View>
      
      <View style={[styles.eventsContainer, { backgroundColor: colors.background }]}>
        <View style={styles.eventsHeader}>
          <Text style={[styles.eventsTitle, { color: colors.text }]}>Etkinlikler</Text>
        </View>
        
        <FlatList
          data={eventsForSelectedDate}
          renderItem={({ item }) => (
            <CalendarEventItem
              event={item}
              onPress={() => handleEditEvent(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={[
            styles.eventsList,
            eventsForSelectedDate.length === 0 && styles.emptyList
          ]}
        />
      </View>
      
      <View style={[styles.footer, { 
        borderTopColor: colors.border,
        backgroundColor: colors.card
      }]}>
        <Button
          title="Etkinlik Ekle"
          onPress={handleAddEvent}
          icon={<Plus size={18} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#8A2BE2', // Purple background
    borderRadius: 12,
    margin: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#8A2BE2', // Purple background
  },
  arrowButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventsList: {
    paddingBottom: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    minWidth: 150,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});