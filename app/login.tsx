import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://192.168.100.242:5232/api/User/login", {
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

      if (!token) {
        throw new Error("Token not found in response");
      }

      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("token", token);

      Alert.alert("Login Successful", `Welcome ${data.username}`);

      // Nếu muốn tự động chuyển trang sau khi login
      router.push("/category_page"); // Chuyển đến trang danh sách category

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          width: "100%",
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          width: "100%",
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Register" onPress={() => router.push("/register")} />
    </View>
  );
}
