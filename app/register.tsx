import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password and Confirm Password do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.100.242:5232/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Register failed");
      }

      const data = await response.json();
      Alert.alert("Register Successful", `Welcome ${data.Name}`);

      // Nếu bạn dùng navigation, có thể chuyển trang login hoặc home ở đây
      router.push("/login");
    } catch (error) {
      Alert.alert("Register Failed", error instanceof Error ? error.message : "Unknown error");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
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
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 12,
          paddingHorizontal: 8,
        }}
      />

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 24,
          paddingHorizontal: 8,
        }}
      />

      <Button
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={loading}
      />
      <Button
        title="Go to Login"
        onPress={() => {
         
          router.push("/login");
        }}/>
    </View>
  );
}
