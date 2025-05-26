import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="expense_page" />
      <Stack.Screen name="add_expense_page" />
      <Stack.Screen name="category_page"/>
    </Stack>
  );
}