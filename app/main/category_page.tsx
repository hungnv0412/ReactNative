import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Category = {
  id: number;
  name: string;
  userId: number;
};

export default function CategoryListScreen({ navigation }: any) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const API_BASE = 'http://192.168.100.242:5232/api';

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/category`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch categories');
      }

      const data: Category[] = await response.json();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Validation', 'Please enter category name');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/category`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Add category error:', errorData);
      }

      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const deleteCategory = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE}/category/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Delete failed');
            }

            Alert.alert('Deleted', 'Category deleted successfully');
            fetchCategories();
          } catch (error) {
            console.error('Delete category error:', (error as Error).message);
            Alert.alert('Error', (error as Error).message);
          }
        },
      },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
      setSearchText('');
      return () => {
        setSearchText('');
      };
    }, [])
  );

  // Filter categories by search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredCategories(categories);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredCategories(categories.filter((c) => c.name.toLowerCase().includes(lower)));
    }
  }, [searchText, categories]);

  const renderItem: ListRenderItem<Category> = ({ item }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={()=>router.push({
        pathname:'/main/expense_page',
        params: {categoryId : item.id}
      })}>
      <Text style={styles.title}>{item.name}</Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteCategory(item.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={22} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Categories</Text>

      <TextInput
        placeholder="Search categories..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
        placeholderTextColor="#aaa"
      />

      <View style={styles.addRow}>
        <TextInput
          placeholder="New category name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          style={styles.addInput}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.addButton} onPress={addCategory} activeOpacity={0.8}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ marginTop: 20, textAlign: 'center', color: '#888' }}>No categories found.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  searchInput: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  addInput: {
    flex: 1,
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#333' },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});