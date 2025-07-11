// app/(tabs)/bought.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Interfaces ---
interface ShoppingItem {
  id: string;
  name: string;
  priority: "High" | "Middle" | "Low";
  bought: boolean;
  dateAdded: string;
  quantity: number;
  dateBought?: string; // New field for when item was bought
}

interface BoughtItemProps {
  item: ShoppingItem;
  onUnmarkBought: (id: string) => void;
  onRemove: (id: string) => void;
}

// --- Helper Component: Single Bought Item ---
const BoughtItem: React.FC<BoughtItemProps> = ({
  item,
  onUnmarkBought,
  onRemove,
}) => {
  // Determine priority text color
  const priorityColorClass =
    item.priority === "High"
      ? "text-red-500"
      : item.priority === "Middle"
        ? "text-orange-500"
        : "text-green-500";

  // Calculate days since bought
  const calculateDaysSinceBought = (dateBoughtString?: string) => {
    if (!dateBoughtString) return 0;
    const boughtDate = new Date(dateBoughtString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - boughtDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceBought = calculateDaysSinceBought(item.dateBought);

  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* Checkmark Icon */}
          <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3">
            <Ionicons name="checkmark" size={20} color="#22c55e" />
          </View>

          {/* Item Details */}
          <View className="flex-1 pr-2">
            <Text className="text-lg font-semibold text-gray-800 mb-1">
              {item.name} ({item.quantity})
            </Text>
            <Text className={`text-sm font-medium ${priorityColorClass} mb-1`}>
              Priority: {item.priority}
            </Text>
            <Text className="text-xs text-gray-500">
              Bought {daysSinceBought} day{daysSinceBought !== 1 ? "s" : ""} ago
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => onUnmarkBought(item.id)}
            className="p-2 rounded-full bg-orange-100 mr-2"
          >
            <Ionicons name="return-up-back-outline" size={20} color="#f97316" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            className="p-2 rounded-full bg-red-100"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Main Bought Items Screen ---
export default function BoughtItemsScreen() {
  const [boughtItems, setBoughtItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bought items from storage
  useEffect(() => {
    loadBoughtItems();
  }, []);

  const loadBoughtItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("shoppingList");
      if (storedItems) {
        const allItems: ShoppingItem[] = JSON.parse(storedItems);
        const bought = allItems.filter((item) => item.bought);
        setBoughtItems(bought);
      }
    } catch (error) {
      console.error("Error loading bought items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to unmark an item as bought (move back to shopping list)
  const unmarkBought = async (id: string) => {
    try {
      const storedItems = await AsyncStorage.getItem("shoppingList");
      if (storedItems) {
        const allItems: ShoppingItem[] = JSON.parse(storedItems);
        const updatedItems = allItems.map((item) =>
          item.id === id
            ? { ...item, bought: false, dateBought: undefined }
            : item
        );
        await AsyncStorage.setItem(
          "shoppingList",
          JSON.stringify(updatedItems)
        );
        setBoughtItems(updatedItems.filter((item) => item.bought));
      }
    } catch (error) {
      console.error("Error unmarking item:", error);
    }
  };

  // Function to remove an item completely
  const removeItem = (id: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to permanently remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const storedItems = await AsyncStorage.getItem("shoppingList");
              if (storedItems) {
                const allItems: ShoppingItem[] = JSON.parse(storedItems);
                const updatedItems = allItems.filter((item) => item.id !== id);
                await AsyncStorage.setItem(
                  "shoppingList",
                  JSON.stringify(updatedItems)
                );
                setBoughtItems(updatedItems.filter((item) => item.bought));
              }
            } catch (error) {
              console.error("Error removing item:", error);
            }
          },
        },
      ]
    );
  };

  // Function to clear all bought items
  const clearAllBought = () => {
    Alert.alert(
      "Clear All Bought Items",
      "Are you sure you want to remove all bought items? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const storedItems = await AsyncStorage.getItem("shoppingList");
              if (storedItems) {
                const allItems: ShoppingItem[] = JSON.parse(storedItems);
                const updatedItems = allItems.filter((item) => !item.bought);
                await AsyncStorage.setItem(
                  "shoppingList",
                  JSON.stringify(updatedItems)
                );
                setBoughtItems([]);
              }
            } catch (error) {
              console.error("Error clearing bought items:", error);
            }
          },
        },
      ]
    );
  };

  // Calculate statistics
  const totalItems = boughtItems.length;
  const highPriorityCount = boughtItems.filter(
    (item) => item.priority === "High"
  ).length;
  const totalQuantity = boughtItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary justify-center items-center">
        <Text className="text-primary text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary ">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mt-4">
        <Text className="text-primary text-4xl font-semibold">
          Bought Items
        </Text>
        {boughtItems.length > 0 && (
          <TouchableOpacity
            onPress={clearAllBought}
            className="p-2 rounded-full bg-red-100"
          >
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Statistics Card */}
      {boughtItems.length > 0 && (
        <View className="bg-white rounded-2xl mx-4 mt-4 p-4 shadow-sm">
          <Text className="text-gray-700 text-lg font-semibold mb-3">
            Summary
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {totalItems}
              </Text>
              <Text className="text-gray-600 text-sm">Items</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">
                {highPriorityCount}
              </Text>
              <Text className="text-gray-600 text-sm">High Priority</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {totalQuantity}
              </Text>
              <Text className="text-gray-600 text-sm">Total Quantity</Text>
            </View>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-1 bg-white rounded-3xl shadow-lg mt-4 p-4">
        <View className="flex-row items-center justify-between px-2 mt-2 mb-4">
          <Text className="text-primary text-2xl font-semibold">
            Completed Shopping
          </Text>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-semibold">
              {totalItems} items
            </Text>
          </View>
        </View>

        {/* Bought Items List */}
        <ScrollView
          className="flex-1 px-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {boughtItems.length > 0 ? (
            boughtItems.map((item) => (
              <BoughtItem
                key={item.id}
                item={item}
                onUnmarkBought={unmarkBought}
                onRemove={removeItem}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="bag-check-outline" size={80} color="#d1d5db" />
              <Text className="text-gray-500 text-xl font-semibold mt-4">
                No bought items yet
              </Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Items you mark as bought will appear here
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
