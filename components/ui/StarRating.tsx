import React from "react";
import { View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { StarIcon } from "@hugeicons/core-free-icons";
import AnimatedPressable from "./AnimatedPressable";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 32 }: StarRatingProps) {
  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <AnimatedPressable key={n} scaleTo={0.8} onPress={() => onChange?.(n)}>
          <HugeiconsIcon
            icon={StarIcon}
            size={size}
            color={n <= value ? "#000000" : "#D4D4D4"}
            strokeWidth={1.6}
            fill={n <= value ? "#000000" : "none"}
          />
        </AnimatedPressable>
      ))}
    </View>
  );
}
