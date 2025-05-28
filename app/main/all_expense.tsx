import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type Expense = {
  id: number;
  description: string;
  amount: number;
  categoryName: string;
  createAt: string;
};

export default function AllExpensePage({ navigation }: any) {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const openEditModal = (expense: Expense) => {
    setExpenseToEdit(expense);
    setEditDescription(expense.description);
    setEditAmount(expense.amount.toString());
    setEditModalVisible(true);
  }
  const API_BASE = 'http://192.168.100.242:5232/api'

  const handleUpdateExpense = async () => {
    if (!expenseToEdit || !editDescription || !editAmount) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/Expense/${expenseToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editDescription,
          amount: parseFloat(editAmount),
          categoryId: categoryId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }
      Alert.alert('Success', 'Expense updated successfully');
      setEditModalVisible(false);
      fetchExpenses(); // Refresh the expense list
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      console.error('Update expense error:', error);
    }
  }
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/Expense/user`, {
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

  useFocusEffect(
    React.useCallback(() => {
      // Khi màn hình được focus, fetch lại dữ liệu và reset state
      fetchExpenses();
      setSearchText('');
      setEditModalVisible(false);
      setExpenseToEdit(null);
      setEditDescription('');
      setEditAmount('');
      return () => {
        setExpenses([]);
        setFilteredExpenses([]);
        setSearchText('');
        setEditModalVisible(false);
        setExpenseToEdit(null);
        setEditDescription('');
        setEditAmount('');
      };
    }, [])
  );

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
            const response = await fetch(`http://192.168.30.24:5232/api/Expense/${id}`, {
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
    <Text style={styles.amount}>
      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
    </Text>
    <Text style={styles.category}>Category: {item.categoryName}</Text>
    <Text style={styles.date}>Date: {new Date(item.createAt).toLocaleDateString()}</Text>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => openEditModal(item)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="edit" size={20} color="#fff" />
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteExpense(item.id)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="delete" size={20} color="#fff" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
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
        placeholderTextColor="#aaa"
      />
  
  
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, textAlign: 'center', color: '#888' }}>
            No expenses found.
          </Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
  
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Edit Expense</Text>
            <TextInput
              placeholder="Description"
              value={editDescription}
              onChangeText={setEditDescription}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateExpense} activeOpacity={0.85}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)} activeOpacity={0.85}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginBottom: 18,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
  item: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  amount: { fontSize: 16, color: '#388e3c', marginBottom: 2 },
  category: { fontSize: 15, color: '#555', marginBottom: 2 },
  date: { fontSize: 14, color: '#888', marginBottom: 6 },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginRight: 8,
    elevation: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 15,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: {
    height: 44,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginRight: 8,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});