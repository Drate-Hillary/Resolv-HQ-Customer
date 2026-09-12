import React from "react";
import { Text, View } from "react-native";
import { RequestStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  submitted: {
    label: "Submitted",
    dot: "bg-neutral-400",
    bg: "bg-neutral-100",
    text: "text-neutral-600",
  },
  processing: {
    label: "Processing",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  review: {
    label: "In Progress",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  needs_info: {
    label: "Needs Info",
    dot: "bg-rose-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
};

export default function StatusPill({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${cfg.bg}`}
    >
      <View className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <Text className={`font-manrope-semibold text-[11px] ${cfg.text}`}>
        {cfg.label}
      </Text>
    </View>
  );
}

export { STATUS_CONFIG };
