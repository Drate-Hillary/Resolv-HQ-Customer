import React from "react";
import { View } from "react-native";

export default function Divider({ className = "" }: { className?: string }) {
  return <View className={`h-px w-full bg-neutral-100 ${className}`} />;
}
