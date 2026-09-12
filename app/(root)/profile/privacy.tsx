import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Database02Icon, SecurityLockIcon, ShieldCheckIcon } from "@hugeicons/core-free-icons";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";

const SECTIONS = [
  {
    icon: ShieldCheckIcon,
    title: "How we use your information",
    body: "Your requests and messages help our AI assistant give you accurate, personalized answers. Sensitive actions are always reviewed by our team before anything changes on your account.",
  },
  {
    icon: Database02Icon,
    title: "What's stored, and for how long",
    body: "We keep your request history and a small set of preferences for 24 months so future support is faster. You can review or delete everything from Saved Information.",
  },
  {
    icon: SecurityLockIcon,
    title: "Who can access it",
    body: "Only you and the support specialists assigned to your requests can see your data. It is never used to train external models.",
  },
];

export default function Privacy() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Privacy" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          {SECTIONS.map((s) => (
            <Card key={s.title} className="mb-4">
              <View className="flex-row items-center gap-2">
                <HugeiconsIcon icon={s.icon} size={16} color="#171717" />
                <Text className="flex-1 font-manrope-bold text-[14px] text-black">
                  {s.title}
                </Text>
              </View>
              <Text className="mt-2 font-manrope-medium text-[13px] leading-5 text-neutral-600">
                {s.body}
              </Text>
            </Card>
          ))}
          <Chip
            label="Manage saved information"
            onPress={() => router.push("/profile/saved-information")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
