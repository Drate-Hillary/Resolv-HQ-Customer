import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import IconButton from "./IconButton";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  right,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
      <View className="flex-row items-center gap-3">
        {showBack && (
          <IconButton
            icon={ArrowLeft02Icon}
            onPress={onBack ?? (() => router.back())}
          />
        )}
        <View>
          <Text className="font-manrope-bold text-[22px] text-black">
            {title}
          </Text>
          {subtitle && (
            <Text className="font-manrope-medium text-[13px] text-neutral-500">
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}
