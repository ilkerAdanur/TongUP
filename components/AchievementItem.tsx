import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Award, Lock, Trophy, BookOpen, Target, Zap, Medal } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';
import { Achievement } from '@/store/user-store';
import { useTheme } from '@/contexts/ThemeContext';

interface AchievementItemProps {
  achievement: Achievement;
  style?: any;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, style }) => {
  const { colors } = useTheme();
  
  const renderIcon = () => {
    const iconSize = 24;
    const iconColor = achievement.isUnlocked ? colors.primary : colors.textLight;
    
    switch (achievement.icon) {
      case 'award':
        return <Award size={iconSize} color={iconColor} />;
      case 'trophy':
        return <Trophy size={iconSize} color={iconColor} />;
      case 'book':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'target':
        return <Target size={iconSize} color={iconColor} />;
      case 'zap':
        return <Zap size={iconSize} color={iconColor} />;
      case 'medal':
        return <Medal size={iconSize} color={iconColor} />;
      default:
        return <Award size={iconSize} color={iconColor} />;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: achievement.isUnlocked ? `${colors.primary}30` : colors.border,
      backgroundColor: achievement.isUnlocked 
        ? `${colors.primary}10`
        : colors.achievementBackground,
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
      backgroundColor: achievement.isUnlocked ? `${colors.primary}20` : `${colors.textLight}20`,
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
      color: achievement.isUnlocked ? colors.primary : colors.text,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: colors.textLight,
    },
    lockContainer: {
      marginLeft: 8,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressText: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 4,
      textAlign: 'right',
    },
  });
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {renderIcon()}
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>
          {!achievement.isUnlocked && (
            <View style={styles.lockContainer}>
              <Lock size={20} color={colors.textLight} />
            </View>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {achievement.progress} / {achievement.maxProgress}
          </Text>
          <ProgressBar 
            progress={achievement.progress / achievement.maxProgress} 
            height={6}
            colors={achievement.isUnlocked 
              ? [colors.primary, colors.primaryLight] 
              : [colors.textLight, colors.textLight]
            }
          />
        </View>
      </View>
    </View>
  );
};