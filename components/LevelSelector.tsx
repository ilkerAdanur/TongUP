import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { proficiencyLevels, ProficiencyLevel } from '@/constants/languages';
import { ChevronDown } from 'lucide-react-native';

interface LevelSelectorProps {
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  label?: string;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel,
  label,
}) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      marginBottom: 8,
      color: colors.text,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.card,
    },
    selectedLevel: {
      fontSize: 14,
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      maxHeight: '70%',
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    modalItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemSelected: {
      backgroundColor: `${colors.primary}15`,
    },
    modalItemText: {
      fontSize: 16,
      color: colors.text,
    },
    modalItemTextSelected: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });
  
  const selectedLevelName = proficiencyLevels.find(level => level.id === selectedLevel)?.name || selectedLevel;
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedLevel}>{selectedLevelName}</Text>
        <ChevronDown size={20} color={colors.text} />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seviye Seçin</Text>
            </View>
            
            <ScrollView>
              {proficiencyLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.modalItem,
                    selectedLevel === level.id && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelectLevel(level.id);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedLevel === level.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};