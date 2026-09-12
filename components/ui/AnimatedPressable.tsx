import React from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends PressableProps {
  scaleTo?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Pressable that eases to `scaleTo` on press-in and springs back on release.
 * Shared across buttons, cards, and list rows for a consistent tactile feel.
 */
export default function AnimatedPressable({
  scaleTo = 0.96,
  className,
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ReanimatedPressable
      className={className}
      style={[animatedStyle, style as any]}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 140 });
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </ReanimatedPressable>
  );
}
