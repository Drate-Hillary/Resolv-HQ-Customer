import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowRight02Icon,
  CustomerSupportIcon,
  Database02Icon,
  Logout04Icon,
  Notification01Icon,
  SecurityLockIcon,
  TaskDone01Icon,
  User03Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import Avatar from "@/components/ui/Avatar";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import Button from "@/components/ui/Button";

interface MenuRow {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
}

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAppState();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  const rows: MenuRow[] = [
    {
      icon: User03Icon,
      label: "Personal Information",
      onPress: () => router.push("/profile/personal-info"),
    },
    {
      icon: TaskDone01Icon,
      label: "My Requests",
      onPress: () => router.push("/requests"),
    },
    {
      icon: Database02Icon,
      label: "Saved Information",
      onPress: () => router.push("/profile/saved-information"),
    },
    {
      icon: Notification01Icon,
      label: "Notification Settings",
      onPress: () => router.push("/profile/notification-settings"),
    },
    {
      icon: CustomerSupportIcon,
      label: "Help & Support",
      onPress: () => router.push("/profile/help-support"),
    },
    {
      icon: SecurityLockIcon,
      label: "Privacy",
      onPress: () => router.push("/profile/privacy"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Text className="px-6 pb-2 pt-4 font-manrope-extrabold text-[26px] text-black">
          Profile
        </Text>

        <Animated.View
          entering={FadeInDown.duration(400)}
          className="items-center px-6 pb-6 pt-4"
        >
          <Avatar initials={user.avatarInitials} size={84} />
          <Text className="mt-3 font-manrope-bold text-[19px] text-black">
            {user.name}
          </Text>
          <Text className="font-manrope-medium text-[13px] text-neutral-500">
            {user.plan} · Member since {user.memberSince}
          </Text>
        </Animated.View>

        <View className="px-6">
          <View className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
            {rows.map((row, i) => (
              <Animated.View key={row.label} entering={FadeInDown.delay(60 + i * 40).duration(350)}>
                <AnimatedPressable
                  scaleTo={0.99}
                  onPress={row.onPress}
                  className={`flex-row items-center gap-3.5 px-4 py-4 ${
                    i !== rows.length - 1 ? "border-b border-neutral-100" : ""
                  }`}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
                    <HugeiconsIcon icon={row.icon} size={17} color="#171717" />
                  </View>
                  <Text className="flex-1 font-manrope-semibold text-[14px] text-black">
                    {row.label}
                  </Text>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#C4C4C4" />
                </AnimatedPressable>
              </Animated.View>
            ))}
          </View>

          <View className="mt-6">
            <Button
              label="Log out"
              variant="danger"
              icon={Logout04Icon}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
