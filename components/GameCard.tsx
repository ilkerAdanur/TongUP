import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brain, Puzzle, Timer, Zap, Award, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GameCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  type?: string;
  playCount?: number;
  bestScore?: number;
  onPress: () => void;
  stats?: Array<{label: string; value: string}>;
  style?: any;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  type,
  playCount = 0,
  bestScore = 0,
  onPress,
  icon,
  stats,
  style
}) => {
  const { colors } = useTheme();
  
  const renderIcon = () => {
    if (icon) return icon;
    
    const iconSize = 24;
    const iconColor = colors.primary;
    
    switch (type) {
      case 'challenge':
        return <Timer size={iconSize} color={iconColor} />;
      case 'wordMatching':
        return <Puzzle size={iconSize} color={iconColor} />;
      case 'wordWriting':
        return <Brain size={iconSize} color={iconColor} />;
      case 'wordSelection':
        return <Zap size={iconSize} color={iconColor} />;
      case 'jumbledLetters':
        return <Award size={iconSize} color={iconColor} />;
      default:
        return <Brain size={iconSize} color={iconColor} />;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
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
    statsContainer: {
      flexDirection: 'row',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    playButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    playButtonText: {
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
        
        {stats ? (
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Oynanma</Text>
              <Text style={styles.statValue}>{playCount} kez</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En İyi Skor</Text>
              <Text style={styles.statValue}>
                {bestScore > 0 ? `%${Math.round(bestScore * 100)}` : '-'}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Oyna</Text>
            <ArrowRight size={16} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};