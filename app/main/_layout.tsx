import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function MainTabs() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="category_page" options={{ title: "Categories",tabBarIcon:({color,size})=>(
                <Ionicons name="list" size={size} color={color}/>
            )}} />
            <Tabs.Screen name="expense_page" options={{ href:null }} />
            <Tabs.Screen name="add_expense_page" options={{ href: null }} />
            <Tabs.Screen name="all_expense" options={{ title:"all Expense",tabBarIcon:({color,size})=>(
                <Ionicons name="receipt" size={size} color={color}/>
            )}} />
            <Tabs.Screen name="profile_page" options={{ title: "Profile",tabBarIcon:({color,size})=>(
                <Ionicons name="person-circle" size={size}  color={color}/>
            ) }} />
        </Tabs>
    )
}