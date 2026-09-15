import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Logout04Icon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import ScreenHeader from "@/components/ui/ScreenHeader";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

// Agents don't need CSAT, memory facts, or notification-preference
// screens — those are customer concepts. Just identity + sign-out.
export default function AgentAccount() {
  const router = useRouter();
  const { user, signOut } = useAppState();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="Account" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center px-6 pb-8 pt-4">
          <Avatar initials={user.avatarInitials} size={84} />
          <Text className="mt-3 font-manrope-bold text-[19px] text-black">{user.name}</Text>
          <Text className="font-manrope-medium text-[13px] text-neutral-500">{user.email}</Text>
          <Text className="mt-1 font-manrope-semibold text-[12px] text-neutral-400">
            Support agent
          </Text>
        </View>
        <View className="px-6">
          <Button label="Log out" variant="danger" icon={Logout04Icon} onPress={handleSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
