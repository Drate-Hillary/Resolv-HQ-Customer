import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
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
import Animated, {
  Easing,
  SlideInDown,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useAppState } from "@/lib/app-state";
import Button from "@/components/ui/Button";

interface Feature {
  icon: IconSvgElement;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: SparklesIcon,
    title: "Meet your AI support assistant",
    description:
      "Ask anything, anytime. Your assistant is grounded in our approved knowledge base — not guesswork.",
  },
  {
    icon: BookOpen01Icon,
    title: "Answers you can trust",
    description:
      "Every response can show its source, so you always know where the guidance came from.",
  },
  {
    icon: TaskDone01Icon,
    title: "Track every request live",
    description:
      "Submit a request in seconds and follow its journey from submission to resolution.",
  },
  {
    icon: SecurityLockIcon,
    title: "You're always in control",
    description:
      "Sensitive actions are reviewed by our team, and you decide what the assistant remembers.",
  },
];

const ORBIT_SIZE = 240;
const ORBIT_RADIUS = 100;
const BUBBLE_SIZE = 56;
const ROTATION_DURATION = 16000;
// Feature i sits at baseAngle = i*(360/count) - 90 (i=0 is top, going clockwise).
// The bubble nearest the bottom (angle 90) at a given rotation is used to derive
// which feature card is "active" below the orbit.
const INITIAL_ACTIVE_INDEX = Math.floor(FEATURES.length / 2);

function OrbitIcons({ rotation }: { rotation: SharedValue<number> }) {
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      className="items-center justify-center self-center">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-black">
        <HugeiconsIcon
          icon={SparklesIcon}
          size={36}
          color="#ffffff"
          strokeWidth={1.6}
        />
      </View>

      <Animated.View
        style={[
          { width: ORBIT_SIZE, height: ORBIT_SIZE, position: "absolute" },
          ringStyle,
        ]}>
        {FEATURES.map((feature, i) => {
          const angle = (i * 360) / FEATURES.length - 90;
          const rad = (angle * Math.PI) / 180;
          const left =
            ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.cos(rad) - BUBBLE_SIZE / 2;
          const top =
            ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.sin(rad) - BUBBLE_SIZE / 2;

          return (
            <OrbitBubble
              key={feature.title}
              icon={feature.icon}
              baseAngle={angle}
              left={left}
              top={top}
              rotation={rotation}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

function OrbitBubble({
  icon,
  baseAngle,
  left,
  top,
  rotation,
}: {
  icon: IconSvgElement;
  baseAngle: number;
  left: number;
  top: number;
  rotation: SharedValue<number>;
}) {
  const bubbleStyle = useAnimatedStyle(() => {
    const effective = (((baseAngle + rotation.value) % 360) + 360) % 360;
    const distanceFromBottom = Math.min(
      Math.abs(effective - 90),
      360 - Math.abs(effective - 90),
    );
    const emphasis = distanceFromBottom < 45 ? 1 - distanceFromBottom / 45 : 0;
    return {
      transform: [{ scale: 1 + 0.2 * emphasis }],
      backgroundColor: emphasis > 0.5 ? "#111111" : "#fafafa",
    };
  });

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          left,
          top,
          position: "absolute",
        },
        bubbleStyle,
      ]}
      className="items-center justify-center rounded-full shadow-sm">
      <Animated.View style={counterStyle}>
        <HugeiconsIcon
          icon={icon}
          size={22}
          color="#111111"
          strokeWidth={1.8}
        />
      </Animated.View>
    </Animated.View>
  );
}

function ActiveFeatureCard({ feature }: { feature: Feature }) {
  return (
    <Animated.View
      key={feature.title}
      entering={SlideInDown.duration(850).easing(Easing.out(Easing.cubic))}
      className="mt-8 rounded-3xl border border-neutral-100 bg-neutral-50 p-5">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-black">
        <HugeiconsIcon
          icon={feature.icon}
          size={20}
          color="#ffffff"
          strokeWidth={1.8}
        />
      </View>
      <Text className="mt-4 font-manrope-bold text-[17px] leading-6 text-black">
        {feature.title}
      </Text>
      <Text className="mt-1.5 font-manrope-medium text-[14px] leading-5 text-neutral-500">
        {feature.description}
      </Text>
    </Animated.View>
  );
}

export default function Onboarding() {
  const { completeOnboarding } = useAppState();
  const router = useRouter();
  const rotation = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(INITIAL_ACTIVE_INDEX);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: ROTATION_DURATION, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  useAnimatedReaction(
    () => rotation.value,
    (value) => {
      const count = FEATURES.length;
      const step = Math.round(value / (360 / count)) % count;
      const index = (((count / 2 - step) % count) + count) % count;
      scheduleOnRN(setActiveIndex, index);
    },
    [],
  );

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 28,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className="text-center font-manrope-extrabold text-[28px] leading-9 text-black">
          Welcome to{"\n"}Resolv HQ
        </Text>
        <Text className="mt-3 text-center font-manrope-medium text-[14px] leading-6 text-neutral-500">
          Here&apos;s what you can do from day one.
        </Text>

        <View className="mt-10">
          <OrbitIcons rotation={rotation} />
        </View>

        <ActiveFeatureCard feature={FEATURES[activeIndex]} />
      </ScrollView>

      <View className="px-7 pb-8 pt-2">
        <Button label="Get Started" onPress={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}
