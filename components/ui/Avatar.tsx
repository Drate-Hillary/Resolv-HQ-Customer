import React from "react";
import { Text, View } from "react-native";

interface AvatarProps {
  initials: string;
  size?: number;
  className?: string;
}

export default function Avatar({ initials, size = 48, className = "" }: AvatarProps) {
  return (
    <View
      className={`items-center justify-center rounded-full bg-black ${className}`}
      style={{ width: size, height: size }}
    >
      <Text
        className="font-manrope-bold text-white"
        style={{ fontSize: size * 0.36 }}
      >
        {initials}
      </Text>
    </View>
  );
}
