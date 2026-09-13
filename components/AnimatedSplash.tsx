import React, { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/**
 * Custom JS splash screen shown right after the native (static image) splash
 * hides. Gives the launch moment a branded, animated beat — a sparkling icon
 * badge followed by the "Resolv-HQ" wordmark — before handing off to
 * onboarding/sign-in/home.
 */
export default function AnimatedSplash() {
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.6);
  const sparkleRotate = useSharedValue(0);
  const sparkleScale = useSharedValue(1);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);

  useEffect(() => {
    badgeOpacity.value = withTiming(1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
    badgeScale.value = withSequence(
      withTiming(1.12, { duration: 380, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
    );

    // Gentle, looping sparkle wiggle + pulse once the badge has landed.
    sparkleRotate.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-14, { duration: 260, easing: Easing.inOut(Easing.quad) }),
          withTiming(14, { duration: 260, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 200, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    sparkleScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.18, { duration: 500, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    textOpacity.value = withDelay(
      280,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    textTranslateY.value = withDelay(
      280,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sparkleRotate.value}deg` },
      { scale: sparkleScale.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Animated.View
        style={badgeStyle}
        className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-black"
      >
        <Animated.View style={sparkleStyle}>
          <HugeiconsIcon
            icon={SparklesIcon}
            size={40}
            color="#ffffff"
            strokeWidth={1.6}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text className="font-manrope-extrabold text-[24px] text-black">
          Resolv-HQ
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
