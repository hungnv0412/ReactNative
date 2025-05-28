import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddExpenseScreen({ navigation }: any) {
  const params = useLocalSearchParams();
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const API_BASE = 'http://192.168.100.242:5232/api'

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setDescription('');
        setAmount('');
      };
    }, [])
  );
  const handleSave = async () => {
    if (!description || !amount || !categoryId) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/Expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          categoryId: parseInt(categoryId, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add expense');
      }

      Alert.alert('Success', 'Expense added successfully');
      router.replace({
        pathname: '/main/expense_page',
        params: { categoryId: categoryId },
      });
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Expense</Text>

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor="#888"
      />

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <MaterialIcons name="save" size={22} color="#fff" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.replace({
              pathname: '/main/expense_page',
              params: { categoryId: categoryId },
            })
          }
          activeOpacity={0.85}
        >
          <MaterialIcons name="cancel" size={22} color="#333" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginRight: 8,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 8,
  },
});