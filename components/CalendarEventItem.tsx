import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '@/types';
import { Clock, CheckCircle, Edit, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface CalendarEventItemProps {
  event: CalendarEvent;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const CalendarEventItem: React.FC<CalendarEventItemProps> = ({
  event,
  onToggleComplete,
  onEdit,
  onDelete,
  onPress,
}) => {
  const { title, description, startDate, reminderTime, isCompleted } = event;
  const { colors } = useTheme();
  
  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "00:00";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return "00:00";
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    completedContainer: {
      opacity: 0.7,
    },
    checkboxContainer: {
      marginRight: 16,
      justifyContent: 'center',
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxUnchecked: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    checkboxChecked: {
      backgroundColor: colors.success,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    completedText: {
      textDecorationLine: 'line-through',
      opacity: 0.7,
    },
    description: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 8,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    time: {
      fontSize: 12,
      color: colors.textLight,
      marginLeft: 4,
    },
    timeSeparator: {
      fontSize: 12,
      color: colors.textLight,
      marginHorizontal: 4,
    },
    reminder: {
      fontSize: 12,
      color: colors.primary,
    },
    actions: {
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 12,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: 'hidden',
    },
    actionButtonGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isCompleted ? styles.completedContainer : null,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {onToggleComplete && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={onToggleComplete}
        >
          <LinearGradient
            colors={isCompleted ? [colors.success, colors.success] : ['transparent', 'transparent']}
            style={[
              styles.checkbox,
              isCompleted ? styles.checkboxChecked : styles.checkboxUnchecked,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isCompleted && <CheckCircle size={20} color="white" />}
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isCompleted ? styles.completedText : null,
        ]}>
          {title}
        </Text>
        
        {description && (
          <Text style={[
            styles.description,
            isCompleted ? styles.completedText : null,
          ]}>
            {description}
          </Text>
        )}
        
        <View style={styles.timeContainer}>
          <Clock size={14} color={colors.textLight} />
          <Text style={styles.time}>{formatTime(startDate)}</Text>
          
          {reminderTime && (
            <>
              <Text style={styles.timeSeparator}>•</Text>
              <Text style={styles.reminder}>Hatırlatma: {formatTime(reminderTime)}</Text>
            </>
          )}
        </View>
      </View>
      
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Edit size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <LinearGradient
                colors={[colors.error, colors.error]}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Trash2 size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};