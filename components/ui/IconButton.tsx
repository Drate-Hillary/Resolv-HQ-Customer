import React from "react";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import AnimatedPressable from "./AnimatedPressable";

interface IconButtonProps {
  icon: IconSvgElement;
  onPress?: () => void;
  size?: number;
  color?: string;
  variant?: "filled" | "outline" | "plain";
  className?: string;
}

export default function IconButton({
  icon,
  onPress,
  size = 20,
  color = "#111111",
  variant = "outline",
  className = "",
}: IconButtonProps) {
  const base =
    variant === "filled"
      ? "bg-black"
      : variant === "outline"
        ? "bg-white border border-neutral-200"
        : "bg-transparent";
  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.9}
      className={`h-11 w-11 items-center justify-center rounded-full ${base} ${className}`}
    >
      <HugeiconsIcon
        icon={icon}
        size={size}
        color={variant === "filled" ? "#ffffff" : color}
        strokeWidth={2}
      />
    </AnimatedPressable>
  );
}
