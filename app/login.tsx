import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE = 'http://192.168.100.242:5232/api'

  const isDisabled = !email.trim() || !password.trim();

  const handleLogin = async () => {
    if (isDisabled) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const token = data.token;
      const username = data.name

      if (!token) {
        throw new Error("Token not found in response");
      }

      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("username",username)


      router.replace("/main/category_page"); // Chuyển đến trang expense_page sau khi đăng nhập thành công

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity
        style={[styles.button, isDisabled && { backgroundColor: "#A5D6A7" }]}
        onPress={handleLogin}
        activeOpacity={0.8}
        disabled={isDisabled}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push("/register")}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Go to Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    letterSpacing: 1,
  },
  input: {
    width: "100%",
    height: 48,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2196F3",
    marginBottom: 0,
  },
  secondaryButtonText: {
    color: "#2196F3",
  },
});