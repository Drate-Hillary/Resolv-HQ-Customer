import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import Animated, { FadeIn } from "react-native-reanimated";

/**
 * Friendly, high-level "the assistant is working" status list. This stands in
 * for the internal Plan/Act/Observe agent loop — the customer sees confidence
 * without any prompt/tool/reasoning detail.
 */
export default function TypingSteps({ steps }: { steps: string[] }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((c) => (c < steps.length ? c + 1 : c));
    }, 380);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <View className="gap-1.5">
      {steps.slice(0, visibleCount).map((step, i) => {
        const done = i < visibleCount - 1 || visibleCount > steps.length;
        return (
          <Animated.View
            key={step}
            entering={FadeIn.duration(250)}
            className="flex-row items-center gap-2"
          >
            {done ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} color="#000000" />
            ) : (
              <PulsingDot />
            )}
            <Text
              className={`font-manrope-medium text-[13px] ${
                done ? "text-neutral-400 line-through" : "text-black"
              }`}
            >
              {step}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

function PulsingDot() {
  return (
    <View className="h-3.5 w-3.5 items-center justify-center">
      <View className="h-2 w-2 rounded-full bg-black" />
    </View>
  );
}
