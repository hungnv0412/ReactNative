import { Tabs } from "expo-router";

export default function MainTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="category_page" options={{ title: "Categories"}} />
            <Tabs.Screen name="expense_page" options={{ href:null }} />
            <Tabs.Screen name="add_expense_page" options={{ href: null }} />
            <Tabs.Screen name="all_expense" options={{ title:"all Expense" }} />
            <Tabs.Screen name="logout_page" options={{ title: "Profile" }} />
        </Tabs>
    )
}