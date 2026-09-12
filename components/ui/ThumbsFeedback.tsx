import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons";
import AnimatedPressable from "./AnimatedPressable";

interface ThumbsFeedbackProps {
  value?: "up" | "down" | null;
  onChange: (value: "up" | "down") => void;
}

export default function ThumbsFeedback({ value, onChange }: ThumbsFeedbackProps) {
  if (value) {
    return (
      <View className="flex-row items-center gap-1.5">
        <HugeiconsIcon
          icon={value === "up" ? ThumbsUpIcon : ThumbsDownIcon}
          size={14}
          color="#000000"
          fill="#000000"
        />
        <Text className="font-manrope-medium text-[12px] text-neutral-500">
          Thanks for the feedback
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-2">
      <AnimatedPressable
        scaleTo={0.85}
        onPress={() => onChange("up")}
        className="h-8 w-8 items-center justify-center rounded-full border border-neutral-200"
      >
        <HugeiconsIcon icon={ThumbsUpIcon} size={14} color="#404040" />
      </AnimatedPressable>
      <AnimatedPressable
        scaleTo={0.85}
        onPress={() => onChange("down")}
        className="h-8 w-8 items-center justify-center rounded-full border border-neutral-200"
      >
        <HugeiconsIcon icon={ThumbsDownIcon} size={14} color="#404040" />
      </AnimatedPressable>
    </View>
  );
}
