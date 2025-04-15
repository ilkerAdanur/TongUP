import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';
import { useCalendarStore } from '@/store/calendar-store';
import { Calendar, Clock, Bell, ArrowLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

export default function AddCalendarEventScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { addEvent } = useCalendarStore();
  
  // Safely parse the date parameter
  const getInitialDate = () => {
    try {
      const dateParam = params.date as string;
      if (dateParam) {
        const parsedDate = new Date(dateParam);
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    } catch (error) {
      console.error('Error parsing date parameter:', error);
    }
    return new Date(); // Default to current date if there's an issue
  };
  
  const initialDate = getInitialDate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(initialDate);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [errors, setErrors] = useState({
    title: '',
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
    };
    
    if (!title.trim()) {
      newErrors.title = 'Başlık alanı boş olamaz';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const newEvent = addEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      startDate: eventDate.toISOString(),
      reminderTime: reminderTime ? reminderTime.toISOString() : undefined,
    });
    
    if (newEvent) {
      Alert.alert(
        'Başarılı',
        'Etkinlik başarıyla eklendi',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert('Hata', 'Etkinlik eklenirken bir hata oluştu');
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowReminderPicker(false);
    }
    
    if (selectedDate) {
      if (showDatePicker) {
        const newDate = new Date(eventDate);
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
        setEventDate(newDate);
      } else if (showTimePicker) {
        const newDate = new Date(eventDate);
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        setEventDate(newDate);
      } else if (showReminderPicker) {
        if (reminderTime) {
          const newTime = new Date(reminderTime);
          newTime.setHours(selectedDate.getHours());
          newTime.setMinutes(selectedDate.getMinutes());
          setReminderTime(newTime);
        } else {
          const newTime = new Date(eventDate);
          newTime.setHours(selectedDate.getHours());
          newTime.setMinutes(selectedDate.getMinutes());
          setReminderTime(newTime);
        }
      }
    }
  };
  
  const showPicker = (type: 'date' | 'time', pickerType: 'event' | 'reminder') => {
    setPickerMode(type);
    
    if (pickerType === 'event') {
      if (type === 'date') {
        setShowDatePicker(true);
        setShowTimePicker(false);
        setShowReminderPicker(false);
      } else {
        setShowDatePicker(false);
        setShowTimePicker(true);
        setShowReminderPicker(false);
      }
    } else {
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowReminderPicker(true);
    }
  };
  
  const formatDate = (date: Date) => {
    try {
      return date.toLocaleDateString('tr-TR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Geçersiz Tarih';
    }
  };
  
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Geçersiz Saat';
    }
  };
  
  // Web-specific date/time picker
  const WebDateTimePicker = ({ 
    visible, 
    mode, 
    value, 
    onChange, 
    onClose 
  }: { 
    visible: boolean; 
    mode: 'date' | 'time'; 
    value: Date; 
    onChange: (date: Date) => void; 
    onClose: () => void; 
  }) => {
    if (!visible) return null;
    
    if (mode === 'date') {
      return (
        <View style={styles.webPickerContainer}>
          <View style={styles.webPickerHeader}>
            <Text style={styles.webPickerTitle}>Tarih Seçin</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.webPickerCloseButton}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <input
            type="date"
            value={value.toISOString().split('T')[0]}
            onChange={(e) => {
              try {
                const newDate = new Date(e.target.value);
                onChange(newDate);
                onClose();
              } catch (error) {
                console.error('Error handling date input change:', error);
              }
            }}
            style={{
              fontSize: '16px',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              width: '100%',
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.webPickerContainer}>
          <View style={styles.webPickerHeader}>
            <Text style={styles.webPickerTitle}>Saat Seçin</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.webPickerCloseButton}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <input
            type="time"
            value={`${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')}`}
            onChange={(e) => {
              try {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const newDate = new Date(value);
                newDate.setHours(hours);
                newDate.setMinutes(minutes);
                onChange(newDate);
                onClose();
              } catch (error) {
                console.error('Error handling time input change:', error);
              }
            }}
            style={{
              fontSize: '16px',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              width: '100%',
            }}
          />
        </View>
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Etkinlik Ekle",
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Input
            label="Başlık"
            placeholder="Etkinlik başlığını girin"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />
          
          <Input
            label="Açıklama (İsteğe Bağlı)"
            placeholder="Etkinlik açıklamasını girin"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />
          
          <View style={styles.dateTimeContainer}>
            <Text style={styles.label}>Tarih ve Saat</Text>
            
            <View style={styles.dateTimeSelectors}>
              <TouchableOpacity
                style={styles.dateTimeSelector}
                onPress={() => showPicker('date', 'event')}
              >
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(eventDate)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateTimeSelector}
                onPress={() => showPicker('time', 'event')}
              >
                <Clock size={20} color={colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(eventDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.reminderContainer}>
            <Text style={styles.label}>Hatırlatma (İsteğe Bağlı)</Text>
            
            {reminderTime ? (
              <View style={styles.reminderSelector}>
                <TouchableOpacity
                  style={styles.dateTimeSelector}
                  onPress={() => showPicker('time', 'reminder')}
                >
                  <Bell size={20} color={colors.secondary} />
                  <Text style={styles.dateTimeText}>{formatTime(reminderTime)}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.removeReminderButton}
                  onPress={() => setReminderTime(null)}
                >
                  <Text style={styles.removeReminderText}>Kaldır</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                title="Hatırlatma Ekle"
                onPress={() => {
                  const newTime = new Date(eventDate);
                  setReminderTime(newTime);
                  showPicker('time', 'reminder');
                }}
                variant="outline"
                icon={<Bell size={18} color={colors.primary} />}
              />
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Etkinliği Kaydet"
          onPress={handleSubmit}
        />
      </View>
      
      {/* Native Date Time Picker for iOS and Android */}
      {Platform.OS !== 'web' && (showDatePicker || showTimePicker || showReminderPicker) && (
        <DateTimePicker
          value={showReminderPicker && reminderTime ? reminderTime : eventDate}
          mode={pickerMode}
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      {/* Web Date Time Picker */}
      {Platform.OS === 'web' && (
        <>
          <WebDateTimePicker
            visible={showDatePicker}
            mode="date"
            value={eventDate}
            onChange={(date) => {
              const newDate = new Date(eventDate);
              newDate.setFullYear(date.getFullYear());
              newDate.setMonth(date.getMonth());
              newDate.setDate(date.getDate());
              setEventDate(newDate);
              setShowDatePicker(false);
            }}
            onClose={() => setShowDatePicker(false)}
          />
          
          <WebDateTimePicker
            visible={showTimePicker}
            mode="time"
            value={eventDate}
            onChange={(date) => {
              const newDate = new Date(eventDate);
              newDate.setHours(date.getHours());
              newDate.setMinutes(date.getMinutes());
              setEventDate(newDate);
              setShowTimePicker(false);
            }}
            onClose={() => setShowTimePicker(false)}
          />
          
          {reminderTime && (
            <WebDateTimePicker
              visible={showReminderPicker}
              mode="time"
              value={reminderTime}
              onChange={(date) => {
                const newTime = new Date(reminderTime);
                newTime.setHours(date.getHours());
                newTime.setMinutes(date.getMinutes());
                setReminderTime(newTime);
                setShowReminderPicker(false);
              }}
              onClose={() => setShowReminderPicker(false)}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeSelectors: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  reminderContainer: {
    marginBottom: 16,
  },
  reminderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeReminderButton: {
    padding: 8,
  },
  removeReminderText: {
    color: colors.error,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  webPickerContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  webPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  webPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  webPickerCloseButton: {
    color: colors.primary,
    fontSize: 16,
  },
});