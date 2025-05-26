import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
    View
} from 'react-native';

type Expense = {
  id: number;
  description: string;
  amount: number;
  categoryName: string;
  createAt: string;
};

export default function ExpenseListScreen({ navigation }: any) {

    const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.100.242:5232/api/Expense/user/', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch expenses');
      }

      const data: Expense[] = await response.json();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      console.error('Fetch expenses error:', error);
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Hàm lọc theo searchText (tìm theo description hoặc id)
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredExpenses(expenses);
    } else {
      const lower = searchText.toLowerCase();
      const filtered = expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(lower) ||
          e.id.toString().includes(lower)
      );
      setFilteredExpenses(filtered);
    }
  }, [searchText, expenses]);

  const deleteExpense = async (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`http://192.168.100.242:5232/api/Expense/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Delete failed');
            }

            Alert.alert('Deleted', 'Expense deleted successfully');
            fetchExpenses();
          } catch (error) {
            Alert.alert('Error', (error as Error).message);
          }
        },
      },
    ]);
  };

  const renderItem: ListRenderItem<Expense> = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.description}</Text>
      <Text>Amount: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</Text>
      <Text>Category: {item.categoryName}</Text>
      <Text>Date: {new Date(item.createAt).toLocaleDateString()}</Text>

      <View style={styles.buttonsContainer}>
        <Button
          title="Edit"
          onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}
        />
        <Button title="Delete" color="red" onPress={() => deleteExpense(item.id)} />
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Expenses</Text>

      <TextInput
        placeholder="Search by description or ID"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <Button
        title="Add New Expense"
        onPress={() => router.push('/add_expense_page')}
      />

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No expenses found.</Text>}
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
    marginBottom: 12,
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
    justifyContent: 'space-between',
    marginTop: 8,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
