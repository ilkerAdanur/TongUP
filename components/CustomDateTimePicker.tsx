import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomDateTimePickerProps {
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
  onClose: () => void;
  visible: boolean;
}

export const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  mode,
  onChange,
  onClose,
  visible,
}) => {
  const [selectedDate, setSelectedDate] = useState(value);
  
  useEffect(() => {
    setSelectedDate(value);
  }, [value]);
  
  const handleConfirm = () => {
    onChange(selectedDate);
    onClose();
  };
  
  // Custom implementation for web
  const renderDatePicker = () => {
    const currentDate = new Date();
    const days = [];
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    
    // Generate days for the current month and the next 2 months
    for (let m = 0; m < 3; m++) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() + m);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      days.push(
        <View key={`month-${month}`} style={styles.monthContainer}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.monthTitleContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.monthTitle}>{months[month]} {year}</Text>
          </LinearGradient>
          <View style={styles.daysGrid}>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const isSelected = 
                date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear();
              
              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayButton,
                    isSelected && styles.selectedButton,
                  ]}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(year);
                    newDate.setMonth(month);
                    newDate.setDate(day);
                    setSelectedDate(newDate);
                  }}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.selectedText,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.datePickerContainer}>
        {days}
      </ScrollView>
    );
  };
  
  const renderTimePicker = () => {
    const hours = [];
    const minutes = [];
    
    // Generate hours (0-23)
    for (let h = 0; h < 24; h++) {
      const isSelected = h === selectedDate.getHours();
      hours.push(
        <TouchableOpacity
          key={`hour-${h}`}
          style={[
            styles.timeButton,
            isSelected && styles.selectedButton,
          ]}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setHours(h);
            setSelectedDate(newDate);
          }}
        >
          <Text style={[
            styles.timeText,
            isSelected && styles.selectedText,
          ]}>
            {h.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Generate minutes (0-59, step 5)
    for (let m = 0; m < 60; m += 5) {
      const isSelected = Math.floor(selectedDate.getMinutes() / 5) * 5 === m;
      minutes.push(
        <TouchableOpacity
          key={`minute-${m}`}
          style={[
            styles.timeButton,
            isSelected && styles.selectedButton,
          ]}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMinutes(m);
            setSelectedDate(newDate);
          }}
        >
          <Text style={[
            styles.timeText,
            isSelected && styles.selectedText,
          ]}>
            {m.toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.timePickerContainer}>
        <View style={styles.timeColumn}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.timeColumnTitleContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.timeColumnTitle}>Saat</Text>
          </LinearGradient>
          <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
            {hours}
          </ScrollView>
        </View>
        
        <View style={styles.timeColumn}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.timeColumnTitleContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.timeColumnTitle}>Dakika</Text>
          </LinearGradient>
          <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
            {minutes}
          </ScrollView>
        </View>
      </View>
    );
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={colors.primaryGradient}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.modalTitle}>
              {mode === 'date' ? 'Tarih Seçin' : 'Saat Seçin'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          {mode === 'date' ? renderDatePicker() : renderTimePicker()}
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <LinearGradient
                colors={colors.primaryGradient}
                style={styles.confirmButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.confirmButtonText}>Tamam</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.textLight,
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerContainer: {
    maxHeight: 400,
  },
  monthContainer: {
    padding: 16,
    paddingTop: 8,
  },
  monthTitleContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timePickerContainer: {
    flexDirection: 'row',
    height: 300,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  timeColumnTitleContainer: {
    width: '100%',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  timeColumnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  timeScroll: {
    width: '100%',
  },
  timeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: colors.text,
  },
});