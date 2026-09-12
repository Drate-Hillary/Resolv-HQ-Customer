import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ServiceRequest } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import StatusPill from "./ui/StatusPill";
import AnimatedPressable from "./ui/AnimatedPressable";

interface RequestCardProps {
  request: ServiceRequest;
  index?: number;
}

export default function RequestCard({ request, index = 0 }: RequestCardProps) {
  const router = useRouter();
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <AnimatedPressable
        scaleTo={0.98}
        onPress={() => router.push({ pathname: "/request/[id]", params: { id: request.id } })}
        className="mb-3 rounded-3xl border border-neutral-200 bg-white p-4"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-manrope-semibold text-[12px] text-neutral-400">
              #{request.code}
            </Text>
            <Text className="mt-0.5 font-manrope-bold text-[16px] text-black">
              {request.title}
            </Text>
          </View>
          <HugeiconsIcon icon={ArrowRight02Icon} size={18} color="#A3A3A3" />
        </View>
        <View className="mt-3 flex-row items-center justify-between">
          <StatusPill status={request.status} />
          <Text className="font-manrope-medium text-[12px] text-neutral-400">
            Updated {timeAgo(request.updatedAt)}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
