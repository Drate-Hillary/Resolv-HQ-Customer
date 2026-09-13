import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import {
  BookOpen01Icon,
  SecurityLockIcon,
  SparklesIcon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import Button from "@/components/ui/Button";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Slide {
  icon: IconSvgElement;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: SparklesIcon,
    title: "Meet your AI\nsupport assistant",
    description:
      "Ask anything, anytime. Your assistant is grounded in our approved knowledge base — not guesswork.",
  },
  {
    icon: BookOpen01Icon,
    title: "Answers you\ncan trust",
    description:
      "Every response can show its source, so you always know where the guidance came from.",
  },
  {
    icon: TaskDone01Icon,
    title: "Track every\nrequest live",
    description:
      "Submit a request in seconds and follow its journey from submission to resolution.",
  },
  {
    icon: SecurityLockIcon,
    title: "You're always\nin control",
    description:
      "Sensitive actions are reviewed by our team, and you decide what the assistant remembers.",
  },
];

export default function Onboarding() {
  const { completeOnboarding } = useAppState();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
    setIndex(i);
  };

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      router.replace("/sign-in");
    } else {
      goTo(index + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 pt-2">
        {!isLast && (
          <AnimatedPressable onPress={() => goTo(SLIDES.length - 1)}>
            <Text className="font-manrope-semibold text-[14px] text-neutral-400">
              Skip
            </Text>
          </AnimatedPressable>
        )}
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setIndex(i);
        }}
      >
        {SLIDES.map((slide, i) => {
          const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.7, 1, 0.7],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <View key={slide.title} style={{ width: SCREEN_WIDTH }} className="items-center justify-center px-10 pt-10">
              <Animated.View
                style={{ transform: [{ scale }], opacity }}
                className="mb-10 h-40 w-40 items-center justify-center rounded-full bg-neutral-50"
              >
                <View className="h-24 w-24 items-center justify-center rounded-full bg-black">
                  <HugeiconsIcon icon={slide.icon} size={40} color="#ffffff" strokeWidth={1.6} />
                </View>
              </Animated.View>
              <Animated.View style={{ opacity }}>
                <Text className="text-center font-manrope-extrabold text-[28px] leading-9 text-black">
                  {slide.title}
                </Text>
                <Text className="mt-4 text-center font-manrope-medium text-[14px] leading-6 text-neutral-500">
                  {slide.description}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View className="flex-row items-center justify-center gap-2 pb-8">
        {SLIDES.map((_, i) => {
          const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });
          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return (
            <Animated.View
              key={i}
              style={{ width: dotWidth, opacity: dotOpacity }}
              className="h-2 rounded-full bg-black"
            />
          );
        })}
      </View>

      <View className="px-7 pb-8">
        <Button label={isLast ? "Get Started" : "Next"} onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}
