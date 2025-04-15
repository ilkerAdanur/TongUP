import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, User, UserPlus, X } from 'lucide-react-native';

interface Friend {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Mock search function
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Simulate API call with mock data
    const mockUsers: Friend[] = [
      {
        id: '1',
        name: 'Mehmet Yılmaz',
        email: 'mehmet@example.com',
        profilePicture: undefined
      },
      {
        id: '2',
        name: 'Zeynep Kaya',
        email: 'zeynep@example.com',
        profilePicture: undefined
      },
      {
        id: '3',
        name: 'Emre Demir',
        email: 'emre@example.com',
        profilePicture: undefined
      }
    ];
    
    // Filter based on search query
    const results = mockUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
  };
  
  const handleAddFriend = (user: Friend) => {
    // Check if already friends
    if (friends.some(friend => friend.id === user.id)) {
      Alert.alert('Bilgi', 'Bu kullanıcı zaten arkadaş listenizde.');
      return;
    }
    
    // Add to friends list
    setFriends(prev => [...prev, user]);
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    
    Alert.alert('Başarılı', `${user.name} arkadaş listenize eklendi.`);
  };
  
  const handleRemoveFriend = (friendId: string) => {
    Alert.alert(
      'Arkadaşı Sil',
      'Bu kişiyi arkadaş listenizden silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setFriends(prev => prev.filter(friend => friend.id !== friendId));
          }
        }
      ]
    );
  };
  
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity 
      style={[styles.friendCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/friend/${item.id}`)}
    >
      <View style={styles.friendInfo}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
          <User size={24} color={colors.primary} />
        </View>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.friendEmail, { color: colors.textLight }]}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFriend(item.id)}
      >
        <X size={20} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  const renderSearchResultItem = ({ item }: { item: Friend }) => (
    <Card style={[styles.searchResultCard, { backgroundColor: colors.card }]}>
      <View style={styles.friendInfo}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
          <User size={24} color={colors.primary} />
        </View>
        <View style={styles.friendDetails}>
          <Text style={[styles.friendName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.friendEmail, { color: colors.textLight }]}>{item.email}</Text>
        </View>
      </View>
      <Button
        title="Ekle"
        onPress={() => handleAddFriend(item)}
        icon={<UserPlus size={16} color="white" />}
        size="small"
        style={styles.addButton}
      />
    </Card>
  );
  
  const EmptyFriendsList = () => (
    <View style={styles.emptyContainer}>
      <User size={48} color={colors.textLight} />
      <Text style={[styles.emptyText, { color: colors.text }]}>Henüz arkadaşınız yok</Text>
      <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
        Arkadaş eklemek için yukarıdaki arama kutusunu kullanabilirsiniz
      </Text>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: colors.friendsBackground,
            borderColor: colors.border
          }]}>
            <Search size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Arkadaş ara..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          <Button
            title="Ara"
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </View>
      </View>
      
      {searchQuery.length > 0 && searchResults.length > 0 ? (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Arama Sonuçları</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.searchResultsList}
          />
        </View>
      ) : null}
      
      <View style={styles.friendsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Arkadaşlarım</Text>
        
        {friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.friendsList}
          />
        ) : (
          <EmptyFriendsList />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchResultsList: {
    gap: 8,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  addButton: {
    paddingHorizontal: 12,
  },
  friendsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  friendsList: {
    gap: 8,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});