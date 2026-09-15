import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Ticket01Icon, User03Icon } from "@hugeicons/core-free-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppState } from "@/lib/app-state";
import { ServiceRequest } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import ScreenHeader from "@/components/ui/ScreenHeader";
import StatusPill from "@/components/ui/StatusPill";
import EmptyState from "@/components/ui/EmptyState";
import IconButton from "@/components/ui/IconButton";
import AnimatedPressable from "@/components/ui/AnimatedPressable";

const PRIORITY_COLOR: Record<ServiceRequest["priority"], string> = {
  low: "text-neutral-400",
  normal: "text-blue-600",
  high: "text-rose-600",
};

function QueueRow({
  request,
  index,
  isMine,
}: {
  request: ServiceRequest;
  index: number;
  isMine: boolean;
}) {
  const router = useRouter();
  const assignmentLabel = !request.assignedAdminId
    ? "Unassigned"
    : isMine
      ? "Assigned to me"
      : (request.assignedAdminName ?? "Assigned");

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(350)}>
      <AnimatedPressable
        scaleTo={0.98}
        onPress={() => router.push({ pathname: "/ticket/[id]", params: { id: request.id } })}
        className="mb-3 rounded-3xl border border-neutral-200 bg-white p-4"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-manrope-semibold text-[12px] text-neutral-400">
              #{request.code} · {request.customerName ?? "Unknown customer"}
            </Text>
            <Text className="mt-0.5 font-manrope-bold text-[16px] text-black">{request.title}</Text>
          </View>
          <Text
            className={`font-manrope-bold text-[11px] uppercase ${PRIORITY_COLOR[request.priority]}`}
          >
            {request.priority}
          </Text>
        </View>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <StatusPill status={request.status} />
            <Text className="font-manrope-medium text-[12px] text-neutral-400">
              {timeAgo(request.updatedAt)}
            </Text>
          </View>
          <Text
            className={`font-manrope-semibold text-[12px] ${
              !request.assignedAdminId ? "text-amber-600" : isMine ? "text-black" : "text-neutral-400"
            }`}
          >
            {assignmentLabel}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function AgentQueue() {
  const router = useRouter();
  const { requests, requestsLoading, user } = useAppState();

  // loadAllData already excludes completed requests for agents; this filter
  // just guards against a stale/optimistic status update leaving one behind.
  const open = requests.filter((r) => r.status !== "completed");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title="Queue"
        subtitle={`${open.length} open request${open.length === 1 ? "" : "s"}`}
        right={<IconButton icon={User03Icon} onPress={() => router.push("/account")} />}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {requestsLoading ? (
          <Text className="mt-10 text-center font-manrope-medium text-[13px] text-neutral-400">
            Loading…
          </Text>
        ) : open.length === 0 ? (
          <EmptyState
            icon={Ticket01Icon}
            title="Queue is empty"
            description="No open requests right now — new ones will show up here."
          />
        ) : (
          open.map((r, i) => (
            <QueueRow key={r.id} request={r} index={i} isMine={r.assignedAdminId === user.id} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
