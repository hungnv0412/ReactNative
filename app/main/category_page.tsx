import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

  const API_BASE = 'http://192.168.30.24:5232/api';

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
      onPress={() =>
        router.push({
          pathname: '/main/expense_page',
          params:{categoryId : item.id}
        })
      }
    >
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.buttonsContainer}>
        {/* Nếu muốn bạn có thể thêm nút sửa ở đây */}
        <Button title="Delete" color="red" onPress={() => deleteCategory(item.id)} />
      </View>
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
      />

      <TextInput
        placeholder="New category name"
        value={newCategoryName}
        onChangeText={setNewCategoryName}
        style={[styles.searchInput, { marginBottom: 12 }]}
      />
      <Button title="Add Category" onPress={addCategory} />

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No categories found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
