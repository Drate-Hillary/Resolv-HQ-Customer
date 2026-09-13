import React from "react";
import { Platform, View } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Home01Icon,
  TaskDone01Icon,
  SparklesIcon,
  Notification01Icon,
  User03Icon,
  DashboardSquare03Icon
} from "@hugeicons/core-free-icons";
import AnimatedTabIcon from "@/components/AnimatedTabIcon";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import { useAppState } from "@/lib/app-state";

export default function TabLayout() {
  const { unreadCount } = useAppState();

  // iOS gets the real system tab bar (Liquid Glass on iOS 26+); Android keeps
  // the custom floating JS tab bar below.
  if (Platform.OS === "ios") {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="requests">
          <NativeTabs.Trigger.Icon
            sf={{ default: "list.bullet.clipboard", selected: "list.bullet.clipboard.fill" }}
          />
          <NativeTabs.Trigger.Label>Requests</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="ai">
          <NativeTabs.Trigger.Icon sf="sparkles" />
          <NativeTabs.Trigger.Label>AI</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="alerts">
          <NativeTabs.Trigger.Icon sf={{ default: "bell", selected: "bell.fill" }} />
          <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
          {unreadCount > 0 && (
            <NativeTabs.Trigger.Badge>{String(unreadCount)}</NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} />
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 24,
          height: 72,
          borderRadius: 28,
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "#F0F0F0",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={DashboardSquare03Icon} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={TaskDone01Icon} label="Requests" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <View className="flex-1 items-center justify-center">
              <AnimatedPressable
                scaleTo={0.9}
                onPress={props.onPress as any}
                className="h-14 w-14 items-center justify-center rounded-full bg-black"
                style={{
                  marginTop: -28,
                  shadowColor: "#000",
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <HugeiconsIcon icon={SparklesIcon} size={24} color="#ffffff" />
              </AnimatedPressable>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon
              icon={Notification01Icon}
              label="Alerts"
              focused={focused}
              badge={unreadCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon icon={User03Icon} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
