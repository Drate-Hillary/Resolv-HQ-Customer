import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Button from "@/components/ui/Button";

interface ContentGateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Loading / failed-to-load placeholder for screens whose copy comes from the database. */
export default function ContentGate({ loading, error, onRetry }: ContentGateProps) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-16" accessibilityLabel="Loading">
        <ActivityIndicator color="#000000" />
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center px-10 py-16">
      <Text className="text-center font-manrope-bold text-[16px] text-black">
        We couldn&apos;t load this content
      </Text>
      <Text className="mt-1 text-center font-manrope-medium text-[13px] leading-5 text-neutral-500">
        {error ?? "Please check your connection and try again."}
      </Text>
      <View className="mt-5 w-full">
        <Button label="Try again" onPress={onRetry} />
      </View>
    </View>
  );
}
