// app/(tabs)/index.tsx

import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Interfaces ---
interface ShoppingItem {
  id: string;
  name: string;
  priority: "High" | "Middle" | "Low";
  bought: boolean;
  dateAdded: string;
  quantity: number;
  dateBought?: string;
}

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggleBought: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
}

interface AddEditItemModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (item: ShoppingItem) => void;
  initialItem?: ShoppingItem | null;
}

// --- Helper Component: Add/Edit Item Modal ---
const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState(initialItem?.name || "");
  const [quantity, setQuantity] = useState(String(initialItem?.quantity || 1));
  const [priority, setPriority] = useState<"High" | "Middle" | "Low">(
    initialItem?.priority || "Middle"
  );

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setQuantity(String(initialItem.quantity));
      setPriority(initialItem.priority);
    } else {
      setName("");
      setQuantity("1");
      setPriority("Middle");
    }
  }, [initialItem]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Item name cannot be empty.");
      return;
    }
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Error", "Quantity must be a positive number.");
      return;
    }

    const newItem: ShoppingItem = {
      id: initialItem?.id || String(Date.now()),
      name: name.trim(),
      quantity: parsedQuantity,
      priority: priority,
      bought: initialItem?.bought || false,
      dateAdded: initialItem?.dateAdded || new Date().toISOString(),
    };
    onSave(newItem);
    onClose();
  };

  const getPriorityIcon = (priorityLevel: string) => {
    switch (priorityLevel) {
      case "High":
        return "alert-circle";
      case "Middle":
        return "remove-circle";
      case "Low":
        return "checkmark-circle";
      default:
        return "remove-circle";
    }
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
      case "High":
        return "#ef4444";
      case "Middle":
        return "#f97316";
      case "Low":
        return "#22c55e";
      default:
        return "#f97316";
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          {/* Header */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-2xl">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-2xl font-bold">
                {initialItem ? "Edit Item" : "Add New Item"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 rounded-full bg-white/20"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Item Name Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                Item Name
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                <Ionicons name="basket-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-3 text-lg text-gray-800"
                  placeholder="Enter item name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Quantity Input */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                Quantity
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                <Ionicons name="layers-outline" size={20} color="#6b7280" />
                <TextInput
                  className="flex-1 ml-3 text-lg text-gray-800"
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            {/* Priority Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-3 ml-1">
                Priority Level
              </Text>
              <View className="space-y-2">
                {["High", "Middle", "Low"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      priority === p
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    onPress={() => setPriority(p as "High" | "Middle" | "Low")}
                  >
                    <Ionicons
                      name={getPriorityIcon(p)}
                      size={24}
                      color={priority === p ? "#3b82f6" : getPriorityColor(p)}
                    />
                    <Text
                      className={`ml-3 text-lg font-medium ${
                        priority === p ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {p} Priority
                    </Text>
                    {priority === p && (
                      <View className="ml-auto">
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#3b82f6"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Footer Buttons */}
          <View className="flex-row p-4 bg-gray-50 rounded-b-2xl">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white mr-2"
            >
              <Text className="text-gray-600 text-lg font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-500 ml-2"
            >
              <Text className="text-white text-lg font-semibold text-center">
                {initialItem ? "Update" : "Add Item"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Helper Component: Single Shopping List Item ---
const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onToggleBought,
  onRemove,
  onEdit,
}) => {
  const priorityColorClass =
    item.priority === "High"
      ? "text-red-500"
      : item.priority === "Middle"
        ? "text-orange-500"
        : "text-green-500";

  const calculateDaysSinceAdded = (dateAddedString: string) => {
    const addedDate = new Date(dateAddedString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceAdded = calculateDaysSinceAdded(item.dateAdded);

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity
          onPress={() => onToggleBought(item.id)}
          className="mr-3"
        >
          <Ionicons
            name={item.bought ? "checkbox-outline" : "square-outline"}
            size={24}
            color={item.bought ? "#F4C70D" : "gray"}
          />
        </TouchableOpacity>
        <View className="flex-1 pr-2">
          <Text
            className={`text-lg font-medium ${item.bought ? "line-through text-gray-500" : "text-gray-800"}`}
          >
            {item.name} ({item.quantity})
          </Text>
          <Text className={`text-sm ${priorityColorClass}`}>
            Priority: {item.priority}
          </Text>
          <Text className="text-xs text-gray-400">
            Added {daysSinceAdded} day{daysSinceAdded !== 1 ? "s" : ""} ago
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => onEdit(item)} className="ml-2 p-1">
          <Ionicons name="create-outline" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemove(item.id)}
          className="ml-2 p-1"
        >
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main Screen Component ---
export default function TabHomeScreen() {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadShoppingList();
    }, [])
  );

  // Load shopping list from AsyncStorage
  const loadShoppingList = async () => {
    try {
      const storedList = await AsyncStorage.getItem("shoppingList");
      if (storedList) {
        setShoppingList(JSON.parse(storedList));
      } else {
        // Initialize with default items if no data exists
        const defaultItems: ShoppingItem[] = [];
        setShoppingList(defaultItems);
        await AsyncStorage.setItem(
          "shoppingList",
          JSON.stringify(defaultItems)
        );
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save shopping list to AsyncStorage
  const saveShoppingList = async (newList: ShoppingItem[]) => {
    try {
      await AsyncStorage.setItem("shoppingList", JSON.stringify(newList));
      setShoppingList(newList);
    } catch (error) {
      console.error("Error saving shopping list:", error);
    }
  };

  // Toggle bought status
  const toggleBought = (id: string) => {
    const updatedList = shoppingList.map((item) =>
      item.id === id
        ? {
            ...item,
            bought: !item.bought,
            dateBought: !item.bought ? new Date().toISOString() : undefined,
          }
        : item
    );
    saveShoppingList(updatedList);
  };

  // Remove item
  const removeItem = (id: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            const updatedList = shoppingList.filter((item) => item.id !== id);
            saveShoppingList(updatedList);
          },
        },
      ]
    );
  };

  // Handle save item (add or edit)
  const handleSaveItem = (newItem: ShoppingItem) => {
    let updatedList;
    if (itemToEdit) {
      updatedList = shoppingList.map((item) =>
        item.id === newItem.id ? newItem : item
      );
    } else {
      updatedList = [...shoppingList, newItem];
    }
    saveShoppingList(updatedList);
    setIsModalVisible(false);
    setItemToEdit(null);
  };

  // Handle add item
  const handleAddItemPress = () => {
    setItemToEdit(null);
    setIsModalVisible(true);
  };

  // Handle edit item
  const handleEditItemPress = (item: ShoppingItem) => {
    setItemToEdit(item);
    setIsModalVisible(true);
  };

  // Filter unbought items only
  const unboughtItems = shoppingList.filter((item) => !item.bought);
  const boughtCount = shoppingList.filter((item) => item.bought).length;

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
        <View className="flex-row items-center">
          <Text className="text-primary text-4xl font-semibold">BuyTrack</Text>
        </View>
        {boughtCount > 0 && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-semibold">
              {boughtCount} bought
            </Text>
          </View>
        )}
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-white rounded-3xl shadow-lg mt-4 p-4">
        <View className="flex-row items-center justify-between px-2 mt-2">
          <Text className="text-primary text-2xl font-semibold">
            Shopping List
          </Text>
          <TouchableOpacity
            onPress={handleAddItemPress}
            className="p-2 rounded-full bg-secondary shadow-md"
          >
            <Ionicons name="add-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Shopping List */}
        <ScrollView
          className="flex-1 px-2 mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {unboughtItems.length > 0 ? (
            unboughtItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggleBought={toggleBought}
                onRemove={removeItem}
                onEdit={handleEditItemPress}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="basket-outline" size={80} color="#d1d5db" />
              <Text className="text-gray-500 text-xl font-semibold mt-4">
                No items in your list
              </Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Add items to get started with your shopping
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal */}
      <AddEditItemModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveItem}
        initialItem={itemToEdit}
      />
    </SafeAreaView>
  );
}
