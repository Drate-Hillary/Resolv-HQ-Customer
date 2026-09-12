import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import Animated, { FadeIn } from "react-native-reanimated";

interface EmptyStateProps {
  icon: IconSvgElement;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="items-center justify-center px-10 py-16"
    >
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <HugeiconsIcon icon={icon} size={28} color="#171717" strokeWidth={1.8} />
      </View>
      <Text className="text-center font-manrope-bold text-[16px] text-black">
        {title}
      </Text>
      {description && (
        <Text className="mt-1 text-center font-manrope-medium text-[13px] leading-5 text-neutral-500">
          {description}
        </Text>
      )}
      {action && <View className="mt-5 w-full">{action}</View>}
    </Animated.View>
  );
}
