import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { WordItem } from '@/components/WordItem';
import { useUserStore } from '@/store/user-store';
import { useWordsStore } from '@/store/words-store';
import { Search, Plus, Filter, Clock, SortAsc, SortDesc, X, ArrowRight } from 'lucide-react-native';
import { Word } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';

export default function WordsScreen() {
  const router = useRouter();
  const { 
    currentLanguage, 
    currentLevel, 
    setCurrentLanguage, 
    setCurrentLevel,
    profile
  } = useUserStore();
  
  const { 
    words, 
    getWordsByLanguage, 
    getWordsByLanguageAndLevel, 
    searchWords, 
    deleteWord 
  } = useWordsStore();
  
  const { colors, isDark } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isFilteringByLevel, setIsFilteringByLevel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'level'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Safeguard against undefined profile
  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  useEffect(() => {
    // Get exercises for the selected language and level
    let wordsToFilter = searchQuery.trim() && hasSearched
      ? searchWords(searchQuery, currentLanguage)
      : isFilteringByLevel 
        ? getWordsByLanguageAndLevel(currentLanguage, currentLevel)
        : getWordsByLanguage(currentLanguage);
    
    // Set no results flag
    setNoResults(searchQuery.trim().length > 0 && hasSearched && wordsToFilter.length === 0);
    
    // Sort words
    const sortedWords = [...wordsToFilter].sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.word.localeCompare(b.word)
          : b.word.localeCompare(a.word);
      } else if (sortBy === 'level') {
        const levelOrder: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return sortOrder === 'asc'
          ? levelOrder[a.proficiencyLevel] - levelOrder[b.proficiencyLevel]
          : levelOrder[b.proficiencyLevel] - levelOrder[a.proficiencyLevel];
      }
      return 0;
    });
    
    setFilteredWords(sortedWords);
  }, [searchQuery, currentLanguage, currentLevel, isFilteringByLevel, words, sortBy, sortOrder, hasSearched]);
  
  const handleAddWord = () => {
    router.push('/word/add');
  };
  
  const handleEditWord = (id: string) => {
    router.push(`/word/edit/${id}`);
  };
  
  const handleDeleteWord = (id: string) => {
    Alert.alert(
      'Kelimeyi Sil',
      'Bu kelimeyi silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          onPress: () => deleteWord(id),
          style: 'destructive',
        },
      ]
    );
  };
  
  const toggleLevelFilter = () => {
    setIsFilteringByLevel(!isFilteringByLevel);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setHasSearched(false);
      setNoResults(false);
    }
  };
  
  const executeSearch = () => {
    // This function is called when the search button is pressed
    if (searchQuery.trim()) {
      setHasSearched(true);
      const results = searchWords(searchQuery, currentLanguage);
      setNoResults(results.length === 0);
      
      // Add to recent searches (max 5)
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
    }
  };
  
  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
    // Immediately execute search when clicking on recent search
    setTimeout(() => {
      setHasSearched(true);
      const results = searchWords(search, currentLanguage);
      setNoResults(results.length === 0);
    }, 0);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setNoResults(false);
    setHasSearched(false);
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {noResults ? (
        <>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Kelime bulunamadı</Text>
          <Text style={[styles.emptyDescription, { color: colors.textLight }]}>
            "{searchQuery}" aramanızla eşleşen kelime bulunamadı. Lütfen başka bir arama terimi deneyin.
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz kelime eklenmemiş</Text>
          <Text style={[styles.emptyDescription, { color: colors.textLight }]}>
            Kelime eklemek için aşağıdaki "Kelime Ekle" butonuna tıklayın.
          </Text>
        </>
      )}
      <Button
        title="Kelime Ekle"
        onPress={handleAddWord}
        icon={<Plus size={18} color="white" />}
        style={styles.emptyButton}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <LanguageSelector
          selectedLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          availableLanguages={profile.selectedLanguages}
        />
        
        <Card style={styles.searchCard}>
          <View style={styles.searchInputContainer}>
            <Search size={24} color={colors.primary} style={styles.searchIcon} />
            <TextInput
              placeholder="Kelime ara..."
              value={searchQuery}
              onChangeText={handleSearch}
              style={[styles.searchInput, { color: colors.text }]}
              placeholderTextColor={colors.textLight}
              onSubmitEditing={executeSearch}
            />
            {searchQuery ? (
              <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity 
              style={[styles.searchButton, { backgroundColor: colors.primary }]} 
              onPress={executeSearch}
            >
              <ArrowRight size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          {recentSearches.length > 0 && !searchQuery && (
            <View style={styles.recentSearchesContainer}>
              <Text style={[styles.recentSearchesTitle, { color: colors.textLight }]}>Son Aramalar</Text>
              <View style={styles.recentSearchesList}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.recentSearchItem, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => handleRecentSearchPress(search)}
                  >
                    <Clock size={14} color={colors.textLight} />
                    <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>
        
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              (isFilteringByLevel || showFilters) ? 
                [styles.filterButtonActive, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }] : 
                { backgroundColor: colors.card }
            ]} 
            onPress={toggleFilters}
          >
            <Filter size={20} color={(isFilteringByLevel || showFilters) ? colors.primary : colors.textLight} />
            <Text style={[
              styles.filterButtonText, 
              { color: (isFilteringByLevel || showFilters) ? colors.primary : colors.textLight }
            ]}>
              Filtrele
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              sortBy === 'date' ? 
                [styles.filterButtonActive, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }] : 
                { backgroundColor: colors.card }
            ]} 
            onPress={() => setSortBy('date')}
          >
            <Clock size={20} color={sortBy === 'date' ? colors.primary : colors.textLight} />
            <Text style={[
              styles.filterButtonText, 
              { color: sortBy === 'date' ? colors.primary : colors.textLight }
            ]}>
              Tarih
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              sortOrder === 'desc' ? 
                [styles.filterButtonActive, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }] : 
                { backgroundColor: colors.card }
            ]} 
            onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          >
            {sortOrder === 'desc' ? (
              <SortDesc size={20} color={colors.primary} />
            ) : (
              <SortAsc size={20} color={colors.textLight} />
            )}
            <Text style={[
              styles.filterButtonText, 
              { color: sortOrder === 'desc' ? colors.primary : colors.textLight }
            ]}>
              {sortOrder === 'desc' ? 'Azalan' : 'Artan'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <Card style={styles.filtersContainer}>
            <View style={styles.filterRow}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Seviye Filtresi</Text>
              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  isFilteringByLevel ? 
                    [styles.toggleButtonActive, { backgroundColor: colors.primary }] : 
                    { backgroundColor: colors.textLight }
                ]} 
                onPress={toggleLevelFilter}
              >
                <View style={[
                  styles.toggleHandle, 
                  isFilteringByLevel ? styles.toggleHandleActive : null
                ]} />
              </TouchableOpacity>
            </View>
            
            {isFilteringByLevel && (
              <View style={styles.levelOptions}>
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelOption,
                      currentLevel === level ? 
                        [styles.levelOptionActive, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }] : 
                        { backgroundColor: colors.card, borderColor: colors.border }
                    ]}
                    onPress={() => setCurrentLevel(level as any)}
                  >
                    <Text style={[
                      styles.levelOptionText,
                      { color: currentLevel === level ? colors.primary : colors.text }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        )}
      </View>
      
      <FlatList
        data={filteredWords}
        renderItem={({ item }) => (
          <WordItem
            word={item}
            onEdit={() => handleEditWord(item.id)}
            onDelete={() => handleDeleteWord(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { backgroundColor: colors.background }]}
        ListEmptyComponent={renderEmptyList}
      />
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title="Kelime Ekle"
          onPress={handleAddWord}
          icon={<Plus size={18} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
  },
  searchCard: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  recentSearchesContainer: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  recentSearchesTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  recentSearchesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentSearchText: {
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  filterButtonActive: {
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 16,
    padding: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#6A5AE0',
  },
  toggleHandle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  toggleHandleActive: {
    transform: [{ translateX: 24 }],
  },
  levelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  levelOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelOptionActive: {
    borderWidth: 1,
  },
  levelOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 150,
  },
});