import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit, Trash2 } from 'lucide-react-native';
import { Card } from './Card';
import { Word } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface WordItemProps {
  word: Word;
  onEdit: () => void;
  onDelete: () => void;
}

export const WordItem: React.FC<WordItemProps> = ({ word, onEdit, onDelete }) => {
  const { colors } = useTheme();
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1':
        return '#4CAF50'; // Green
      case 'A2':
        return '#8BC34A'; // Light Green
      case 'B1':
        return '#FFC107'; // Amber
      case 'B2':
        return '#FF9800'; // Orange
      case 'C1':
        return '#FF5722'; // Deep Orange
      case 'C2':
        return '#F44336'; // Red
      default:
        return colors.primary;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFC']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.word}>{word.word}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(word.proficiencyLevel) + '20', borderColor: getLevelColor(word.proficiencyLevel) }]}>
              <Text style={[styles.levelText, { color: getLevelColor(word.proficiencyLevel) }]}>{word.proficiencyLevel}</Text>
            </View>
          </View>
          
          <Text style={styles.translation}>{word.translation}</Text>
          
          {word.notes && (
            <Text style={styles.notes}>{word.notes}</Text>
          )}
          
          <View style={styles.footer}>
            <Text style={styles.dateText}>
              Eklenme: {formatDate(word.createdAt)}
            </Text>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  word: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  dateText: {
    fontSize: 12,
    color: '#718096',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 6,
  },
});