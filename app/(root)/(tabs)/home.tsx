import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  ArrowRight02Icon,
  BookOpen01Icon,
  Notification01Icon,
  SparklesIcon,
  TaskAdd01Icon,
} from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/ui/Avatar";
import IconButton from "@/components/ui/IconButton";
import AnimatedPressable from "@/components/ui/AnimatedPressable";
import QuickAction from "@/components/QuickAction";
import RequestCard from "@/components/RequestCard";
import ActivityItem from "@/components/ActivityItem";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const router = useRouter();
  const { user, requests, notifications, unreadCount } = useAppState();
  const firstName = user.name.split(" ")[0];
  const activeRequests = requests.filter((r) => r.status !== "completed").slice(0, 2);
  const recentActivity = notifications.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="flex-row items-center justify-between px-6 pb-2 pt-4"
        >
          <View className="flex-row items-center gap-3">
            <Avatar initials={user.avatarInitials} size={46} />
            <View>
              <Text className="font-manrope-medium text-[13px] text-neutral-500">
                {greeting()},
              </Text>
              <Text className="font-manrope-bold text-[19px] text-black">
                {firstName} 👋
              </Text>
            </View>
          </View>
          <View className="relative">
            <IconButton icon={Notification01Icon} onPress={() => router.push("/alerts")} />
            {unreadCount > 0 && (
              <View className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-black" />
            )}
          </View>
        </Animated.View>

        <View className="px-6 pt-4">
          <Text className="font-manrope-extrabold text-[26px] leading-8 text-black">
            How can we help{"\n"}you today?
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)} className="px-6 pt-5">
          <AnimatedPressable
            scaleTo={0.98}
            onPress={() => router.push("/ai")}
            className="overflow-hidden rounded-[28px] bg-black p-5"
          >
            <View className="flex-row items-center justify-between">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <HugeiconsIcon icon={SparklesIcon} size={20} color="#ffffff" />
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#ffffff" />
              </View>
            </View>
            <Text className="mt-4 font-manrope-bold text-[19px] text-white">
              ✨ Ask AI
            </Text>
            <Text className="mt-1 font-manrope-medium text-[13px] text-white/70">
              Get grounded assistance, sourced from our knowledge base
            </Text>
          </AnimatedPressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(140).duration(400)}
          className="flex-row gap-3 px-6 pt-4"
        >
          <QuickAction
            icon={TaskAdd01Icon}
            label="Create Request"
            description="Get help fast"
            onPress={() => router.push("/request/create")}
          />
          <QuickAction
            icon={BookOpen01Icon}
            label="Help Centre"
            description="Browse articles"
            onPress={() => router.push("/help")}
          />
        </Animated.View>

        <View className="px-6 pt-8">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-manrope-bold text-[17px] text-black">
              Your Requests
            </Text>
            <AnimatedPressable onPress={() => router.push("/requests")}>
              <Text className="font-manrope-semibold text-[13px] text-neutral-500">
                See all
              </Text>
            </AnimatedPressable>
          </View>
          {activeRequests.length > 0 ? (
            activeRequests.map((r, i) => <RequestCard key={r.id} request={r} index={i} />)
          ) : (
            <Text className="font-manrope-medium text-[13px] text-neutral-400">
              No active requests right now.
            </Text>
          )}
        </View>

        <View className="px-6 pt-4">
          <Text className="mb-2 font-manrope-bold text-[17px] text-black">
            Recent Activity
          </Text>
          <View className="rounded-3xl border border-neutral-200 bg-white p-4">
            {recentActivity.map((n) => (
              <ActivityItem key={n.id} label={n.title} time={timeAgo(n.createdAt)} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
