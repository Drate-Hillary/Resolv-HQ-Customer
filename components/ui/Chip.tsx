import React from "react";
import { Text } from "react-native";
import AnimatedPressable from "./AnimatedPressable";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  className?: string;
}

export default function Chip({ label, active, onPress, className = "" }: ChipProps) {
  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.94}
      className={`rounded-full border px-4 py-2 ${
        active ? "border-black bg-black" : "border-neutral-200 bg-white"
      } ${className}`}
    >
      <Text
        className={`font-manrope-semibold text-[13px] ${
          active ? "text-white" : "text-neutral-600"
        }`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
