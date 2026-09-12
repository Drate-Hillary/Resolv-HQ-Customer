import React from "react";
import { Text, View } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  BellIcon,
  CheckmarkCircle02Icon,
  Message01Icon,
  SparklesIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AppNotification, NotificationType } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import AnimatedPressable from "./ui/AnimatedPressable";

const ICONS: Record<NotificationType, any> = {
  request_update: BellIcon,
  ai: SparklesIcon,
  support: Message01Icon,
  completed: CheckmarkCircle02Icon,
  system: InformationCircleIcon,
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress?: () => void;
  index?: number;
}

export default function NotificationItem({
  notification,
  onPress,
  index = 0,
}: NotificationItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(350)}>
      <AnimatedPressable
        scaleTo={0.98}
        onPress={onPress}
        className="mb-2.5 flex-row items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${
            notification.read ? "bg-neutral-100" : "bg-black"
          }`}
        >
          <HugeiconsIcon
            icon={ICONS[notification.type]}
            size={16}
            color={notification.read ? "#525252" : "#ffffff"}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            {!notification.read && (
              <View className="h-1.5 w-1.5 rounded-full bg-black" />
            )}
            <Text className="font-manrope-bold text-[14px] text-black">
              {notification.title}
            </Text>
          </View>
          <Text className="mt-0.5 font-manrope-medium text-[13px] leading-5 text-neutral-500">
            {notification.body}
          </Text>
          <Text className="mt-1 font-manrope-medium text-[11px] text-neutral-400">
            {timeAgo(notification.createdAt)}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}
