// app/(tabs)/_layout.tsx
import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabIcon = ({ focused, icon, title }: any) => {
  return focused ? (
    // Removed the unnecessary Fragment <>...</>
    <View className="flex flex-col w-full flex-1 min-w-[112px] min-h-16 mt-9 justify-center items-center rounded-full overflow-hidden bg-secondary">
      <Image source={icon} tintColor="#151312" className="size-5" />
      <Text className="text-primary text-base font-semibold ml-2">{title}</Text>
    </View>
  ) : (
    <View className="size-full flex-1  min-w-[112px] justify-center items-center mt-9 min-h-16 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
      <Text className="text-primary text-base font-semibold ml-2">{title}</Text>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#FCF7F4",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 70,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#0F0D23", // Corrected hex color: added '#'
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop List",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Shop List" />
          ),
        }}
      />

      <Tabs.Screen
        name="bought"
        options={{
          title: "Bought Items",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Bought" />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Analytics" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
