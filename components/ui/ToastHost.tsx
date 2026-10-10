import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { dismissToast, subscribeToasts, ToastItem, ToastKind } from "@/lib/toast";

const KIND_STYLE: Record<ToastKind, { icon: typeof Alert02Icon; accent: string; label: string }> = {
  success: { icon: CheckmarkCircle02Icon, accent: "#10B981", label: "Success" },
  error: { icon: Alert02Icon, accent: "#F43F5E", label: "Error" },
  info: { icon: InformationCircleIcon, accent: "#60A5FA", label: "Notice" },
};

function ToastCard({ item }: { item: ToastItem }) {
  const progress = useRef(new Animated.Value(0)).current;
  const style = KIND_STYLE[item.kind];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
          { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
        ],
      }}
    >
      <Pressable
        onPress={() => dismissToast(item.id)}
        accessibilityRole="alert"
        accessibilityLabel={`${style.label}: ${item.title}`}
        accessibilityHint="Tap to dismiss"
        className="flex-row items-start gap-3 rounded-2xl bg-neutral-900 px-4 py-3.5"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: style.accent,
        }}
      >
        <View className="pt-0.5">
          <HugeiconsIcon icon={style.icon} size={20} color={style.accent} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="font-manrope-bold text-[14px] text-white">{item.title}</Text>
          {item.description ? (
            <Text className="mt-0.5 font-manrope-medium text-[12.5px] leading-[18px] text-neutral-300">
              {item.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Renders the stack of active toasts. Mount once, inside the safe-area provider, above all navigation. */
export default function ToastHost() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, gap: 8, zIndex: 1000 }}
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </View>
  );
}
