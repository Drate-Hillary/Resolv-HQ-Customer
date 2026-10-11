import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import { SparklesIcon } from "@hugeicons/core-free-icons";
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
import ContentGate from "@/components/ui/ContentGate";
import { contentIcon } from "@/lib/content-icons";
import type { AppContent } from "@/lib/types";

type Feature = AppContent["onboarding"]["features"][number];

const ORBIT_SIZE = 240;
const ORBIT_RADIUS = 100;
const BUBBLE_SIZE = 56;
const ROTATION_DURATION = 16000;
// Feature i sits at baseAngle = i*(360/count) - 90 (i=0 is top, going clockwise).
// The bubble nearest the bottom (angle 90) at a given rotation is used to derive
// which feature card is "active" below the orbit.

function OrbitIcons({ rotation, features }: { rotation: SharedValue<number>; features: Feature[] }) {
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
        {features.map((feature, i) => {
          const angle = (i * 360) / features.length - 90;
          const rad = (angle * Math.PI) / 180;
          const left =
            ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.cos(rad) - BUBBLE_SIZE / 2;
          const top =
            ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.sin(rad) - BUBBLE_SIZE / 2;

          return (
            <OrbitBubble
              key={feature.title}
              icon={contentIcon(feature.icon)}
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
          icon={contentIcon(feature.icon)}
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
  const { content, contentLoading, contentError, reloadContent } = useAppState();
  if (!content || content.onboarding.features.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ContentGate loading={contentLoading} error={contentError} onRetry={reloadContent} />
      </SafeAreaView>
    );
  }
  return <OnboardingBody copy={content.onboarding} />;
}

function OnboardingBody({ copy }: { copy: AppContent["onboarding"] }) {
  const { completeOnboarding } = useAppState();
  const router = useRouter();
  const rotation = useSharedValue(0);
  const features = copy.features;
  const [activeIndex, setActiveIndex] = useState(Math.floor(features.length / 2));

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
      const count = features.length;
      const step = Math.round(value / (360 / count)) % count;
      const index = (((count / 2 - step) % count) + count) % count;
      scheduleOnRN(setActiveIndex, index);
    },
    [features.length],
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
          {copy.title}
        </Text>
        <Text className="mt-3 text-center font-manrope-medium text-[14px] leading-6 text-neutral-500">
          {copy.subtitle}
        </Text>

        <View className="mt-10">
          <OrbitIcons rotation={rotation} features={features} />
        </View>

        <ActiveFeatureCard feature={features[activeIndex] ?? features[0]} />
      </ScrollView>

      <View className="px-7 pb-8 pt-2">
        <Button label={copy.cta} onPress={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}
