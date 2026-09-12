import React from "react";
import { ActivityIndicator, Text } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import AnimatedPressable from "./AnimatedPressable";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconSvgElement;
  iconPosition?: "left" | "right";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-black border border-black",
  secondary: "bg-white border border-neutral-300",
  ghost: "bg-transparent border border-transparent",
  danger: "bg-white border border-red-200",
};

const TEXT_CLASSES: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-black",
  ghost: "text-black",
  danger: "text-red-600",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2.5 rounded-xl",
  md: "px-5 py-3.5 rounded-2xl",
  lg: "px-6 py-4 rounded-2xl",
};

const TEXT_SIZE: Record<Size, string> = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[16px]",
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  fullWidth = true,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={0.97}
      className={`${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} flex-row items-center justify-center gap-2 ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#000000"}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <HugeiconsIcon
              icon={icon}
              size={18}
              color={variant === "primary" ? "#ffffff" : "#111111"}
              strokeWidth={2}
            />
          )}
          <Text
            className={`font-manrope-semibold ${TEXT_SIZE[size]} ${TEXT_CLASSES[variant]}`}
          >
            {label}
          </Text>
          {icon && iconPosition === "right" && (
            <HugeiconsIcon
              icon={icon}
              size={18}
              color={variant === "primary" ? "#ffffff" : "#111111"}
              strokeWidth={2}
            />
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
