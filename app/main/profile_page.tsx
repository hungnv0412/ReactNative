import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Profile() {
  const [monthlyStats, setMonthlyStats] = useState<{ year: number, month: number, totalAmount: number }[]>([]);
  const router = useRouter();

  const fetchMonthlyStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.30.24:5232/api/Expense/total', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('failed to fetch');
      const data = await response.json();
      setMonthlyStats(data.total);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      setMonthlyStats([]);
    }
  };

  useEffect(() => { fetchMonthlyStats(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('Logged out', 'You have been logged out.');
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color="#007AFF" />
        <Text style={styles.header}>Tài khoản của bạn</Text>
      </View>
      <Text style={styles.statistic}>Thống kê chi tiêu hàng tháng</Text>
      {monthlyStats.length === 0 ? (
        <Text style={styles.noData}>Không có dữ liệu.</Text>
      ) : (
        <View style={styles.cardList}>
          {monthlyStats.map(item => (
            <View style={styles.card} key={`${item.year}-${item.month}`}>
              <Text style={styles.cardMonth}>
                Tháng {item.month}/{item.year}
              </Text>
              <Text style={styles.cardAmount}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalAmount)}
              </Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f7f7f7' },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#222' },
  statistic: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#007AFF' },
  noData: { fontSize: 16, color: '#888', marginBottom: 24 },
  cardList: { width: '100%' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardMonth: { fontSize: 16, color: '#555', marginBottom: 4 },
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 32,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});