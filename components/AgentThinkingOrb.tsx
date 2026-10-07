import { useEffect, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { orbStates } from "./agent-thinking-orb-states";

const dotsByState = [
  [[12, 3], [19, 7], [20, 16], [13, 21], [5, 17], [4, 8]],
  [[12, 2], [18, 5], [21, 11], [17, 18], [11, 21], [5, 17], [3, 10]],
  [[12, 4], [17, 5], [20, 11], [17, 17], [12, 19], [7, 17], [4, 11], [7, 6]],
  [[12, 2], [20, 8], [18, 17], [10, 21], [4, 14], [6, 6]],
  [[12, 3], [17, 4], [21, 9], [20, 15], [15, 20], [8, 20], [3, 14], [4, 8]],
  [[12, 3], [19, 6], [20, 13], [16, 19], [9, 20], [4, 15], [5, 8]],
  [[12, 3], [18, 5], [21, 12], [17, 19], [11, 21], [5, 17], [3, 10], [8, 4]],
  [[12, 4], [18, 6], [19, 14], [13, 19], [6, 16], [5, 9]],
  [[12, 2], [19, 7], [18, 17], [12, 21], [5, 17], [4, 8]],
] as const;

export default function AgentThinkingOrb({ size = 20 }: { size?: number }) {
  const [stateIndex, setStateIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rotation = useSharedValue(0);
  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReduceMotion(enabled);
        if (enabled) setStateIndex(0);
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      rotation.value = 0;
      return;
    }

    const interval = setInterval(() => {
      setStateIndex((current) => (current + 1) % orbStates.length);
    }, 1800);
    rotation.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      clearInterval(interval);
      rotation.value = 0;
    };
  }, [reduceMotion, rotation]);

  const dots = dotsByState[stateIndex];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Assistant ${orbStates[stateIndex]}`}
      style={{ width: size, height: size }}
    >
      <Animated.View style={[{ width: size, height: size }, orbitStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Ellipse
            cx="12"
            cy="12"
            rx="9"
            ry="4"
            fill="none"
            stroke="#737373"
            strokeWidth="0.7"
            opacity="0.7"
          />
          <Ellipse
            cx="12"
            cy="12"
            rx="4"
            ry="9"
            fill="none"
            stroke="#a3a3a3"
            strokeWidth="0.7"
            opacity="0.65"
          />
          <Circle
            cx="12"
            cy="12"
            r="2.1"
            fill="#171717"
            opacity={stateIndex === 7 ? 0.55 : 1}
          />
          {dots.map(([cx, cy], index) => (
            <Circle
              key={`${cx}-${cy}-${index}`}
              cx={cx}
              cy={cy}
              r={index === stateIndex % dots.length ? 1.25 : 0.85}
              fill="#171717"
              opacity={index === stateIndex % dots.length ? 1 : 0.65}
            />
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}
