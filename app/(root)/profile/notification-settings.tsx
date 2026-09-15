import React from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Card from "@/components/ui/Card";

export default function NotificationSettings() {
  const { user, updatePreferences } = useAppState();

  const prefs: { id: "pushNotifications" | "emailNotifications"; label: string; detail: string }[] = [
    {
      id: "pushNotifications",
      label: "Push notifications",
      detail: "Request updates, AI assistance, support replies, and completions on this device.",
    },
    {
      id: "emailNotifications",
      label: "Email notifications",
      detail: "A copy of the same updates sent to your email address.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Notification Settings" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <Card className="mb-1 overflow-hidden !p-0">
            {prefs.map((pref, i) => (
              <View
                key={pref.id}
                className={`flex-row items-center gap-3 px-4 py-4 ${
                  i !== prefs.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <View className="flex-1">
                  <Text className="font-manrope-bold text-[13px] text-black">
                    {pref.label}
                  </Text>
                  <Text className="mt-0.5 font-manrope-medium text-[12px] text-neutral-500">
                    {pref.detail}
                  </Text>
                </View>
                <Switch
                  value={user[pref.id]}
                  onValueChange={(v) => {
                    void updatePreferences({ [pref.id]: v });
                  }}
                  trackColor={{ false: "#E5E5E5", true: "#000000" }}
                  thumbColor="#ffffff"
                />
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
