import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowRight02Icon,
  BookOpen01Icon,
  Mail01Icon,
  SparklesIcon,
  TaskAdd01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react-native";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import Card from "@/components/ui/Card";

export default function HelpSupport() {
  const router = useRouter();

  const options: { icon: IconSvgElement; label: string; detail: string; onPress: () => void }[] = [
    {
      icon: SparklesIcon,
      label: "Ask the AI assistant",
      detail: "Get an instant, grounded answer",
      onPress: () => router.push("/ai"),
    },
    {
      icon: BookOpen01Icon,
      label: "Browse the Help Centre",
      detail: "Search approved articles and guides",
      onPress: () => router.push("/help"),
    },
    {
      icon: TaskAdd01Icon,
      label: "Create a request",
      detail: "Route your issue to our support team",
      onPress: () => router.push("/request/create"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Help & Support" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <View className="mb-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            {options.map((opt, i) => (
              <AnimatedPressable
                key={opt.label}
                scaleTo={0.99}
                onPress={opt.onPress}
                className={`flex-row items-center gap-3.5 px-4 py-4 ${
                  i !== options.length - 1 ? "border-b border-neutral-100" : ""
                }`}
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                  <HugeiconsIcon icon={opt.icon} size={17} color="#171717" />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-[14px] text-black">{opt.label}</Text>
                  <Text className="font-manrope-medium text-[12px] text-neutral-500">
                    {opt.detail}
                  </Text>
                </View>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#C4C4C4" />
              </AnimatedPressable>
            ))}
          </View>

          <Card>
            <View className="flex-row items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} size={16} color="#171717" />
              <Text className="font-manrope-bold text-[13px] text-black">
                Still need a human?
              </Text>
            </View>
            <Text className="mt-1.5 font-manrope-medium text-[12px] leading-5 text-neutral-500">
              Our support team typically replies within one business day at
              support@resolvhq.com.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
