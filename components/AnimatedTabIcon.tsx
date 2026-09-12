import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedTabIconProps {
  icon: IconSvgElement;
  label: string;
  focused: boolean;
  badge?: number;
}

export default function AnimatedTabIcon({
  icon,
  label,
  focused,
  badge,
}: AnimatedTabIconProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 180 });
    // `progress` is a Reanimated shared value — its identity is stable across
    // renders, so it's intentionally left out of the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 2 }, { scale: 1 + progress.value * 0.08 }],
  }));

  return (
    <View className="items-center justify-center" style={{ width: 60, gap: 3 }}>
      <Animated.View style={iconStyle} className="relative">
        <HugeiconsIcon
          icon={icon}
          size={22}
          color={focused ? "#000000" : "#A3A3A3"}
          strokeWidth={focused ? 2 : 1.8}
        />
        {!!badge && badge > 0 && (
          <View className="absolute -right-2 -top-1.5 h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1">
            <Text className="font-manrope-bold text-[9px] text-white">
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        )}
      </Animated.View>
      <Text
        className={`font-manrope-semibold text-[10px] ${focused ? "text-black" : "text-neutral-400"}`}
      >
        {label}
      </Text>
    </View>
  );
}
