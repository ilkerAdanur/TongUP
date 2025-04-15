import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, MessageSquare, CheckSquare, ArrowRight, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ExerciseCardProps {
  title: string;
  description: string;
  type: 'sentenceTranslation' | 'wordTranslation' | 'multipleChoice';
  completed: boolean;
  count: number;
  onPress: () => void;
  style?: any;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  type,
  completed,
  count,
  onPress,
  style
}) => {
  const { colors } = useTheme();
  
  const renderIcon = () => {
    const iconSize = 24;
    const iconColor = colors.primary;
    
    switch (type) {
      case 'sentenceTranslation':
        return <MessageSquare size={iconSize} color={iconColor} />;
      case 'wordTranslation':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'multipleChoice':
        return <CheckSquare size={iconSize} color={iconColor} />;
      default:
        return <BookOpen size={iconSize} color={iconColor} />;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: completed ? `${colors.primary}30` : colors.border,
      backgroundColor: completed ? `${colors.primary}10` : colors.card,
      overflow: 'hidden',
    },
    content: {
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${colors.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: colors.textLight,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    countContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    count: {
      fontSize: 14,
      color: colors.textLight,
    },
    completedIcon: {
      marginLeft: 8,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    startButtonText: {
      color: 'white',
      fontWeight: '500',
      marginRight: 4,
    },
  });
  
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.countContainer}>
            <Text style={styles.count}>{count} alıştırma</Text>
            {completed && (
              <View style={styles.completedIcon}>
                <Check size={16} color={colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Başla</Text>
            <ArrowRight size={16} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};