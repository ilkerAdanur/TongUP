import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { languages } from '@/constants/languages';
import { ChevronDown } from 'lucide-react-native';

interface LanguageSelectorProps {
  selectedLanguage?: string;
  selectedLanguages?: string[];
  onSelectLanguage?: (languageId: string) => void;
  onToggleLanguage?: (languageId: string) => void;
  availableLanguages?: string[];
  label?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  selectedLanguages,
  onSelectLanguage,
  onToggleLanguage,
  availableLanguages,
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
    selectedLanguage: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageFlag: {
      fontSize: 18,
      marginRight: 8,
    },
    languageName: {
      fontSize: 16,
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
    languagesContainer: {
      padding: 8,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    languageItemSelected: {
      backgroundColor: `${colors.primary}15`,
    },
    languageItemText: {
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    languageItemTextSelected: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    checkmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkSelected: {
      backgroundColor: colors.primary,
    },
    checkmarkInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'white',
    },
  });
  
  const getSelectedLanguageName = () => {
    if (selectedLanguage) {
      const language = languages.find(lang => lang.id === selectedLanguage);
      return language ? (
        <View style={styles.selectedLanguage}>
          <Text style={styles.languageFlag}>{language.flag}</Text>
          <Text style={styles.languageName}>{language.nativeName}</Text>
        </View>
      ) : (
        <Text style={styles.languageName}>Dil Seçin</Text>
      );
    } else {
      return <Text style={styles.languageName}>Dil Seçin</Text>;
    }
  };
  
  const filteredLanguages = availableLanguages 
    ? languages.filter(lang => availableLanguages.includes(lang.id))
    : languages;
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        {getSelectedLanguageName()}
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
              <Text style={styles.modalTitle}>Dil Seçin</Text>
            </View>
            
            <ScrollView>
              <View style={styles.languagesContainer}>
                {filteredLanguages.map((language) => {
                  const isSelected = selectedLanguage === language.id || 
                    (selectedLanguages && selectedLanguages.includes(language.id));
                  
                  return (
                    <TouchableOpacity
                      key={language.id}
                      style={[
                        styles.languageItem,
                        isSelected && styles.languageItemSelected,
                      ]}
                      onPress={() => {
                        if (onSelectLanguage) {
                          onSelectLanguage(language.id);
                          setModalVisible(false);
                        } else if (onToggleLanguage) {
                          onToggleLanguage(language.id);
                        }
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.languageFlag}>{language.flag}</Text>
                        <Text
                          style={[
                            styles.languageItemText,
                            isSelected && styles.languageItemTextSelected,
                          ]}
                        >
                          {language.nativeName}
                        </Text>
                      </View>
                      
                      {onToggleLanguage && (
                        <View style={[styles.checkmark, isSelected && styles.checkmarkSelected]}>
                          {isSelected && <View style={styles.checkmarkInner} />}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};