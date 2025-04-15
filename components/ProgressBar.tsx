import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showPercentage?: boolean;
  colors?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showPercentage = false,
  colors: customColors,
}) => {
  const { colors } = useTheme();
  
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Default gradient colors
  const gradientColors = customColors || [colors.primary, colors.primaryLight];
  
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      backgroundColor: `${colors.border}50`,
      borderRadius: height / 2,
      overflow: 'hidden',
    },
    progressContainer: {
      height,
      width: `${clampedProgress * 100}%`,
      borderRadius: height / 2,
    },
    percentageContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 4,
    },
    percentageText: {
      fontSize: 12,
      color: colors.textLight,
    },
  });
  
  return (
    <View>
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>
            {Math.round(clampedProgress * 100)}%
          </Text>
        </View>
      )}
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressContainer}
        />
      </View>
    </View>
  );
};