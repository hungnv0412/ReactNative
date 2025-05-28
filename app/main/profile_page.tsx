import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Profile() {
  const [monthlyStats, setMonthlyStats] = useState<{ year: number, month: number, totalAmount: number }[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = 'http://192.168.100.242:5232/api';

  const fetchMonthlyStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('username');
      setUsername(user ?? 'Người dùng');

      const response = await fetch(`${API_BASE}/Expense/total`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Không thể tải dữ liệu');
      const data = await response.json();
      setMonthlyStats(data.total);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
      setMonthlyStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonthlyStats(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('Đăng xuất', 'Bạn đã đăng xuất khỏi hệ thống.');
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.username}>{username}</Text>
        <Ionicons name="settings-outline" size={24} color="#007AFF" />
      </View>

      <View style={styles.profileSection}>
        <Ionicons name="person-circle" size={100} color="#007AFF" />
      </View>

      <Text style={styles.sectionTitle}>Chi tiêu hàng tháng</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : monthlyStats.length === 0 ? (
        <Text style={styles.noData}>Không có dữ liệu chi tiêu.</Text>
      ) : (
        <View style={styles.cardList}>
          {monthlyStats.map(item => (
            <View style={styles.card} key={`${item.year}-${item.month}`}>
              <Text style={styles.cardMonth}>Tháng {item.month}/{item.year}</Text>
              <Text style={styles.cardAmount}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.totalAmount)}
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
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  noData: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardMonth: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 36,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
