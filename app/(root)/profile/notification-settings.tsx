import React, { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Card from "@/components/ui/Card";

interface Pref {
  id: string;
  label: string;
  detail: string;
  enabled: boolean;
}

const INITIAL_PREFS: Pref[] = [
  {
    id: "p1",
    label: "Request updates",
    detail: "Status changes on any of your requests.",
    enabled: true,
  },
  {
    id: "p2",
    label: "AI assistance",
    detail: "When the assistant prepares something that may help.",
    enabled: true,
  },
  {
    id: "p3",
    label: "Support messages",
    detail: "New replies from our human support team.",
    enabled: true,
  },
  {
    id: "p4",
    label: "Completed requests",
    detail: "A final confirmation once a request is resolved.",
    enabled: true,
  },
  {
    id: "p5",
    label: "Product updates",
    detail: "Occasional news about new features.",
    enabled: false,
  },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(INITIAL_PREFS);

  const toggle = (id: string) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));

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
                  value={pref.enabled}
                  onValueChange={() => toggle(pref.id)}
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
