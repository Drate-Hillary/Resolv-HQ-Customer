import React, { useMemo } from "react";
import { SectionList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { useAppState } from "@/lib/app-state";
import { dayBucket } from "@/lib/format";
import { AppNotification } from "@/lib/types";
import NotificationItem from "@/components/NotificationItem";
import EmptyState from "@/components/ui/EmptyState";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

export default function Alerts() {
  const router = useRouter();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } =
    useAppState();

  const sections = useMemo(() => {
    const buckets = new Map<string, AppNotification[]>();
    for (const n of notifications) {
      const key = dayBucket(n.createdAt);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(n);
    }
    const order = ["Today", "Yesterday", "This week", "Earlier"];
    return order
      .filter((k) => buckets.has(k))
      .map((k) => ({ title: k, data: buckets.get(k)! }));
  }, [notifications]);

  const handlePress = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.requestId) router.push({ pathname: "/request/[id]", params: { id: n.requestId } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="font-manrope-extrabold text-[26px] text-black">Notifications</Text>
        {unreadCount > 0 && (
          <AnimatedPressable onPress={markAllNotificationsRead}>
            <Text className="font-manrope-semibold text-[13px] text-neutral-500">
              Mark all read
            </Text>
          </AnimatedPressable>
        )}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text className="mb-2 mt-3 font-manrope-bold text-[13px] text-neutral-400">
            {section.title}
          </Text>
        )}
        renderItem={({ item, index }) => (
          <NotificationItem
            notification={item}
            index={index}
            onPress={() => handlePress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Notification01Icon}
            title="You're all caught up"
            description="We'll let you know the moment something changes on your requests."
          />
        }
      />
    </SafeAreaView>
  );
}
