import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BookOpen01Icon } from "@hugeicons/core-free-icons";

export default function SourceTag({ title }: { title: string }) {
  return (
    <View className="mt-2 flex-row items-center gap-1.5 self-start rounded-full bg-neutral-100 px-2.5 py-1.5">
      <HugeiconsIcon icon={BookOpen01Icon} size={12} color="#525252" />
      <Text className="font-manrope-semibold text-[11px] text-neutral-600">
        Based on: {title}
      </Text>
    </View>
  );
}
