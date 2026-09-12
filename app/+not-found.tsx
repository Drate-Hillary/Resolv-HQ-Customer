import React from "react";
import { Text, View } from "react-native";
import { Link, Stack } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-white px-8">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <HugeiconsIcon icon={Alert01Icon} size={28} color="#171717" />
        </View>
        <Text className="font-manrope-bold text-[18px] text-black">
          This screen doesn&apos;t exist
        </Text>
        <Link href="/home" className="mt-5">
          <Text className="font-manrope-bold text-[14px] text-black underline">
            Go back to Home
          </Text>
        </Link>
      </View>
    </>
  );
}
