import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '@/contexts/ThemeContext';

interface StatItem {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  progress?: number;
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
  style?: any;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, stats, style }) => {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    statsContainer: {
      gap: 16,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIconContainer: {
      marginRight: 12,
    },
    statContent: {
      flex: 1,
    },
    statLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    progressContainer: {
      marginTop: 8,
    },
  });
  
  return (
    <Card style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index}>
            <View style={styles.statItem}>
              {stat.icon && (
                <View style={styles.statIconContainer}>
                  {stat.icon}
                </View>
              )}
              
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                
                {stat.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <ProgressBar 
                      progress={stat.progress} 
                      height={6}
                      colors={[colors.primary, colors.primaryLight]}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};