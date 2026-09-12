import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function ActivityItem({
  label,
  time,
}: {
  label: string;
  time: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5 py-1.5">
      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#22C55E" />
      <Text className="flex-1 font-manrope-medium text-[13px] text-neutral-700">
        {label}
      </Text>
      <Text className="font-manrope-medium text-[11px] text-neutral-400">
        {time}
      </Text>
    </View>
  );
}
