import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import AnimatedPressable from "./ui/AnimatedPressable";

interface QuickActionProps {
  icon: IconSvgElement;
  label: string;
  description: string;
  onPress?: () => void;
  dark?: boolean;
  className?: string;
}

export default function QuickAction({
  icon,
  label,
  description,
  onPress,
  dark = false,
  className = "",
}: QuickActionProps) {
  return (
    <AnimatedPressable
      scaleTo={0.96}
      onPress={onPress}
      className={`flex-1 rounded-3xl border p-4 ${
        dark ? "border-black bg-black" : "border-neutral-200 bg-white"
      } ${className}`}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          dark ? "bg-white/15" : "bg-neutral-100"
        }`}
      >
        <HugeiconsIcon
          icon={icon}
          size={18}
          color={dark ? "#ffffff" : "#111111"}
          strokeWidth={2}
        />
      </View>
      <Text
        className={`mt-3 font-manrope-bold text-[14px] ${dark ? "text-white" : "text-black"}`}
      >
        {label}
      </Text>
      <Text
        className={`mt-0.5 font-manrope-medium text-[12px] ${dark ? "text-white/70" : "text-neutral-500"}`}
      >
        {description}
      </Text>
    </AnimatedPressable>
  );
}
